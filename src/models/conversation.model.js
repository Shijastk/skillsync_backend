import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: String },
    lastMessageTime: { type: Date, default: Date.now },
    unreadCounts: { type: Map, of: Number, default: {} }, // userId -> count
    isGroup: { type: Boolean, default: false },
    contextId: { type: String }, // For swap context etc
    type: { type: String } // 'swap_request' or 'normal'
}, {
    timestamps: true
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
