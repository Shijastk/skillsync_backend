import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['swap_request', 'swap_accepted', 'swap_rejected', 'swap_completed', 'message', 'comment', 'like', 'group_invite', 'achievement'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed }, // Additional context data
    relatedEntity: {
        type: { type: String, enum: ['Swap', 'Message', 'Post', 'Group', 'User'] },
        id: { type: mongoose.Schema.Types.ObjectId }
    },
    isRead: { type: Boolean, default: false },
    actionUrl: { type: String }, // URL to navigate to when clicked
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
