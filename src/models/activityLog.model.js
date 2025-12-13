import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        required: true,
        enum: [
            'login',
            'profile_complete',
            'swap_created',
            'swap_completed',
            'post_created',
            'referral',
            'badge_earned',
            'milestone_reached',
            'level_up'
        ]
    },
    skillcoinsEarned: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    metadata: { type: mongoose.Schema.Types.Mixed },
    processed: { type: Boolean, default: false } // For preventing duplicate rewards
}, {
    timestamps: true
});

// Index for efficient querying
activityLogSchema.index({ user: 1, type: 1, createdAt: -1 });
activityLogSchema.index({ processed: 1, createdAt: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
