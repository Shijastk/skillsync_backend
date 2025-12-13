import { Server } from 'socket.io';
import { logger } from '../utils/logger.js';

let io;
const activeUsers = new Map(); // userId -> socketId mapping

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000, // 60 seconds
        pingInterval: 25000 // 25 seconds
    });

    io.on('connection', (socket) => {
        logger.info(`🔌 Socket connected: ${socket.id}`);

        // Join a room based on user ID (for private notifications)
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId);
                activeUsers.set(userId, socket.id);
                logger.info(`👤 User ${userId} joined their room`);

                // Broadcast online status
                io.emit('user_online', { userId });
            }
        });

        // Join a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(conversationId);
            logger.info(`💬 Socket ${socket.id} joined conversation ${conversationId}`);
        });

        // Send a message
        socket.on('send_message', (message) => {
            if (message.conversationId) {
                // Broadcast to conversation room
                io.to(message.conversationId).emit('receive_message', message);

                // Send individual notifications to participants
                if (message.participants) {
                    message.participants.forEach(participantId => {
                        if (participantId !== message.sender) {
                            io.to(participantId).emit('new_message_notification', {
                                conversationId: message.conversationId,
                                sender: message.sender,
                                preview: message.content
                            });
                        }
                    });
                }
            }
        });

        // Typing indicators
        socket.on('typing', ({ conversationId, userId }) => {
            socket.to(conversationId).emit('participant_typing', { userId });
        });

        socket.on('stop_typing', ({ conversationId, userId }) => {
            socket.to(conversationId).emit('participant_stopped_typing', { userId });
        });

        // Video call events
        socket.on('call_user', ({ to, from, signal }) => {
            io.to(to).emit('incoming_call', { from, signal });
        });

        socket.on('answer_call', ({ to, signal }) => {
            io.to(to).emit('call_answered', { signal });
        });

        socket.on('end_call', ({ to }) => {
            io.to(to).emit('call_ended');
        });

        // Online presence
        socket.on('disconnect', () => {
            logger.info(`🔌 Socket disconnected: ${socket.id}`);

            // Find and remove user from active users
            for (const [userId, socketId] of activeUsers.entries()) {
                if (socketId === socket.id) {
                    activeUsers.delete(userId);
                    io.emit('user_offline', { userId });
                    logger.info(`👤 User ${userId} went offline`);
                    break;
                }
            }
        });
    });

    logger.info('✅ Socket.io initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const getActiveUsers = async () => {
    return Array.from(activeUsers.keys());
};

export const isUserOnline = (userId) => {
    return activeUsers.has(userId);
};
