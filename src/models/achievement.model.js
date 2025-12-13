import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['badge', 'milestone', 'level_up', 'streak', 'referral']
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String },
    tier: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },
    requirement: { type: mongoose.Schema.Types.Mixed }, // Flexible requirement definition
    reward: {
        skillcoins: { type: Number, default: 0 },
        xp: { type: Number, default: 0 },
        bonus: { type: String }
    },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
