import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], default: 'Beginner' }
});

const badgeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    earnedAt: { type: Date, default: Date.now },
    tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' }
});

const milestoneSchema = new mongoose.Schema({
    type: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    reward: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    bio: { type: String },
    location: { type: String },
    role: { type: String, default: 'user' },

    // SKILLCOIN WALLET (renamed from credits)
    skillcoins: { type: Number, default: 50 }, // Start with 50 free skillcoins

    // GAMIFICATION
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    badges: [badgeSchema],
    milestones: [milestoneSchema],

    // ACTIVITY TRACKING
    loginStreak: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    totalSwaps: { type: Number, default: 0 },
    completedSwaps: { type: Number, default: 0 },

    // REFERRAL SYSTEM
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCount: { type: Number, default: 0 },

    // SKILLS
    skillsToTeach: [skillSchema],
    skillsToLearn: [skillSchema],
    isActive: { type: Boolean, default: true },
}, {
    timestamps: true
});

// Generate referral code before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') && this.referralCode) {
        return next();
    }

    // Hash password
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Generate referral code if not exists
    if (!this.referralCode) {
        this.referralCode = uuidv4().slice(0, 8).toUpperCase();
    }

    next();
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function () {
    // Level formula: Level = floor(sqrt(XP / 50))
    const calculatedLevel = Math.floor(Math.sqrt(this.xp / 50)) + 1;
    return Math.max(1, calculatedLevel);
};

// Update level based on XP
userSchema.methods.updateLevel = function () {
    const newLevel = this.calculateLevel();
    if (newLevel > this.level) {
        this.level = newLevel;
        return { leveledUp: true, newLevel };
    }
    return { leveledUp: false, newLevel: this.level };
};

// Add XP and auto-level up
userSchema.methods.addXP = async function (amount) {
    this.xp += amount;
    const levelChange = this.updateLevel();
    await this.save();
    return levelChange;
};

// Award skillcoins
userSchema.methods.awardSkillcoins = async function (amount, description) {
    this.skillcoins += amount;
    await this.save();

    // Create transaction record (handled by caller)
    return this.skillcoins;
};

// Spend skillcoins
userSchema.methods.spendSkillcoins = async function (amount) {
    if (this.skillcoins < amount) {
        throw new Error('Insufficient skillcoins');
    }
    this.skillcoins -= amount;
    await this.save();
    return this.skillcoins;
};

const User = mongoose.model('User', userSchema);
export default User;
