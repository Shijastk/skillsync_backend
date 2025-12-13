import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { getIO } from '../socket/socketHandler.js';

// @desc    Get all conversations for user
// @route   GET /api/conversations
// @access  Private
export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id
        })
            .populate('participants', 'firstName lastName avatar')
            .sort({ lastMessageTime: -1 });

        res.json(conversations);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({
            conversationId: req.params.conversationId
        })
            .populate('sender', 'firstName lastName avatar')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, type, attachmentUrl } = req.body;

        const message = await Message.create({
            conversationId,
            sender: req.user._id,
            content,
            type: type || 'text',
            attachmentUrl
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: type === 'image' ? 'Sent an image' : content,
            lastMessageTime: Date.now()
        });

        const fullMessage = await message.populate('sender', 'firstName lastName avatar');

        // Real-time via Socket
        try {
            const io = getIO();
            io.to(conversationId).emit('receive_message', fullMessage);
        } catch (err) {
            console.error("Socket emit error", err);
        }

        res.status(201).json(fullMessage);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Add user to readBy array if not already there
        if (!message.readBy.includes(userId)) {
            message.readBy.push(userId);
            await message.save();
        }

        // Update conversation unread count
        await Conversation.findByIdAndUpdate(
            message.conversationId,
            {
                $set: {
                    [`unreadCounts.${userId}`]: 0
                }
            }
        );

        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

