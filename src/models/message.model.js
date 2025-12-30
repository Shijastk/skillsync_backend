import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ['text', 'image', 'voice', 'video', 'file', 'call', 'system', 'session_scheduled'],
        default: 'text'
    },
    attachmentUrl: { type: String },
    // Media metadata (for optimization)
    metadata: {
        fileName: String,
        fileSize: Number,
        mimeType: String,
        duration: Number, // For voice/video in seconds
        thumbnail: String, // Thumbnail URL for video/image
        width: Number, // For images/video
        height: Number, // For images/video
        // For scheduling
        sessionDate: String,
        modality: String,
        sessionDetail: String
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
    timestamps: true
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
