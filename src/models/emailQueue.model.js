import mongoose from 'mongoose';

const emailQueueSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    template: {
        type: String,
        required: true,
        enum: [
            'welcome',
            'swap_confirmed',
            'swap_completed',
            'skillcoin_earned',
            'referral_bonus',
            'level_up',
            'badge_earned',
            'milestone_reached'
        ]
    },
    variables: { type: mongoose.Schema.Types.Mixed }, // Template variables
    status: {
        type: String,
        enum: ['pending', 'sending', 'sent', 'failed'],
        default: 'pending'
    },
    scheduledFor: { type: Date, default: Date.now },
    sentAt: { type: Date },
    error: { type: String },
    retryCount: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Index for queue processing
emailQueueSchema.index({ status: 1, scheduledFor: 1 });
emailQueueSchema.index({ user: 1, template: 1 });

const EmailQueue = mongoose.model('EmailQueue', emailQueueSchema);
export default EmailQueue;
