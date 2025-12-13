import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skillOffered: { type: String, required: true },
    skillRequested: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'scheduled', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },

    // SCHEDULING with AUTO-EXPIRY
    scheduledDate: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    autoExpireAt: { type: Date }, // Automatically calculated
    completedAt: { type: Date },

    duration: { type: String, default: '1 hour' },
    availability: { type: String },
    preferences: {
        videoCalls: { type: Boolean, default: true },
        screenSharing: { type: Boolean, default: false },
        projectBased: { type: Boolean, default: false }
    },

    // SKILLCOIN REWARDS
    skillcoinsEarned: { type: Number, default: 50 },
    bonusMultiplier: { type: Number, default: 1.0 },
    skillcoinsAwarded: { type: Boolean, default: false } // Prevent duplicate awards
}, {
    timestamps: true
});

// Calculate auto-expire time before save
swapSchema.pre('save', function (next) {
    // If swap is scheduled or active and has an end time, set auto-expire
    if ((this.status === 'scheduled' || this.status === 'active') && this.endTime) {
        this.autoExpireAt = this.endTime;
    }

    // If scheduledDate is set but no startTime/endTime, calculate them
    if (this.scheduledDate && !this.startTime) {
        this.startTime = new Date(this.scheduledDate);

        // Parse duration (e.g., "1 hour", "30 minutes")
        const durationMatch = this.duration.match(/(\d+)\s*(hour|minute|hr|min)/i);
        let durationMs = 60 * 60 * 1000; // Default 1 hour

        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();

            if (unit.startsWith('hour') || unit === 'hr') {
                durationMs = value * 60 * 60 * 1000;
            } else if (unit.startsWith('min')) {
                durationMs = value * 60 * 1000;
            }
        }

        this.endTime = new Date(this.startTime.getTime() + durationMs);
        this.autoExpireAt = this.endTime;
    }

    next();
});

const Swap = mongoose.model('Swap', swapSchema);
export default Swap;
