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
            .sort({ lastMessageTime: -1 })
            .lean(); // Return plain objects

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
            .sort({ createdAt: 1 })
            .lean(); // Return plain objects

        res.json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to get display text for different message types
const getMessageDisplayText = (type, content, fileName) => {
    const displays = {
        text: content,
        image: '📷 Image',
        voice: '🎤 Voice message',
        video: '🎥 Video',
        file: fileName ? `📎 ${fileName}` : '📎 File',
        call: '📞 Call',
        system: content
    };
    return displays[type] || content;
};

// @desc    Send a message (with media support)
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, type } = req.body;
        let attachmentUrl = req.body.attachmentUrl;
        let metadata = req.body.metadata || {};

        // Handle file upload (voice/image/video/file)
        if (req.file) {
            attachmentUrl = req.file.path; // Cloudinary URL

            // Extract metadata for optimization
            metadata = {
                fileName: req.file.originalname,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                // Cloudinary provides these
                width: req.file.width,
                height: req.file.height,
                // For audio/video duration would be extracted by Cloudinary
            };
        }

        // Set appropriate content based on type
        const messageContent = content || getMessageDisplayText(type, content, metadata.fileName);

        // Create message with metadata
        const message = await Message.create({
            conversationId,
            sender: req.user._id,
            content: messageContent,
            type: type || 'text',
            attachmentUrl,
            metadata: Object.keys(metadata).length > 0 ? metadata : undefined
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: getMessageDisplayText(type, messageContent, metadata.fileName),
            lastMessageTime: Date.now()
        });

        // Populate sender and convert to clean JSON
        await message.populate('sender', 'firstName lastName avatar');
        const cleanMessage = message.toJSON();

        // Real-time via Socket - send clean message
        try {
            const io = getIO();
            io.to(conversationId).emit('receive_message', cleanMessage);
        } catch (err) {
            console.error("Socket emit error", err);
        }

        res.status(201).json(cleanMessage);
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

        res.json({ success: true, message: message.toJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create or get existing conversation
// @route   POST /api/conversations
// @access  Private
export const createConversation = async (req, res) => {
    try {
        const { participants, type, contextId, lastMessage, isGroup } = req.body;

        // Ensure current user is in participants - ensure we are working with strings
        const participantIds = (participants || []).map(p => p.toString());
        if (!participantIds.includes(req.user._id.toString())) {
            participantIds.push(req.user._id.toString());
        }

        // Check if conversation already exists (for direct/swap types)
        if (!isGroup) {
            const existingConv = await Conversation.findOne({
                participants: { $all: participantIds, $size: participantIds.length }
            }).populate('participants', 'firstName lastName avatar');

            if (existingConv) {
                if (lastMessage) {
                    existingConv.lastMessage = lastMessage;
                    existingConv.lastMessageTime = Date.now();
                    if (contextId) existingConv.contextId = contextId;
                    await existingConv.save();
                }
                return res.status(200).json(existingConv);
            }
        }

        const newConversation = await Conversation.create({
            participants: participantIds,
            type: type || 'direct',
            contextId,
            lastMessage: lastMessage || 'New conversation',
            lastMessageTime: Date.now(),
            isGroup: isGroup || false,
            unreadCounts: {}
        });

        await newConversation.populate('participants', 'firstName lastName avatar');

        res.status(201).json(newConversation);
    } catch (error) {
        console.error("Error creating conversation:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
