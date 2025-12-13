import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import Achievement from './models/achievement.model.js';
import User from './models/user.model.js';
import { logger } from './utils/logger.js';

dotenv.config();

const achievements = [
    {
        type: 'first_swap',
        name: 'First Timer',
        description: 'Complete your first skill swap',
        icon: '🎯',
        tier: 'bronze',
        requirement: { completedSwaps: 1 },
        reward: { skillcoins: 30, xp: 20 }
    },
    {
        type: 'swap_10',
        name: 'Skill Sharer',
        description: 'Complete 10 skill swaps',
        icon: '🌟',
        tier: 'silver',
        requirement: { completedSwaps: 10 },
        reward: { skillcoins: 100, xp: 50 }
    },
    {
        type: 'swap_50',
        name: 'Exchange Expert',
        description: 'Complete 50 skill swaps',
        icon: '👑',
        tier: 'gold',
        requirement: { completedSwaps: 50 },
        reward: { skillcoins: 500, xp: 200 }
    },
    {
        type: 'swap_100',
        name: 'Master Swapper',
        description: 'Complete 100 skill swaps',
        icon: '💎',
        tier: 'platinum',
        requirement: { completedSwaps: 100 },
        reward: { skillcoins: 1000, xp: 500 }
    },
    {
        type: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day login streak',
        icon: '🔥',
        tier: 'bronze',
        requirement: { loginStreak: 7 },
        reward: { skillcoins: 50, xp: 30 }
    },
    {
        type: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day login streak',
        icon: '⚡',
        tier: 'gold',
        requirement: { loginStreak: 30 },
        reward: { skillcoins: 200, xp: 100 }
    },
    {
        type: 'referral_5',
        name: 'Connector',
        description: 'Refer 5 friends to SkillSwap',
        icon: '🎁',
        tier: 'silver',
        requirement: { referralCount: 5 },
        reward: { skillcoins: 250, xp: 100 }
    },
    {
        type: 'profile_complete',
        name: 'Prepared Pro',
        description: 'Complete your profile with bio and skills',
        icon: '✨',
        tier: 'bronze',
        requirement: { profileComplete: true },
        reward: { skillcoins: 20, xp: 10 }
    }
];

const seedAchievements = async () => {
    try {
        await connectDB();

        logger.info('🌱 Seeding achievements...');

        // Clear existing achievements
        await Achievement.deleteMany({});

        // Create new achievements
        await Achievement.insertMany(achievements);

        logger.info(`✅ Seeded ${achievements.length} achievements`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error seeding achievements:', error);
        process.exit(1);
    }
};

// Migration: Update existing users
const migrateExistingUsers = async () => {
    try {
        await connectDB();

        logger.info('🔄 Migrating existing users...');

        const users = await User.find({});

        for (const user of users) {
            let updated = false;

            // Rename credits to skillcoins if exists
            if (user.credits !== undefined) {
                user.skillcoins = user.credits || 50;
                user.credits = undefined;
                updated = true;
            }

            // Ensure skillcoins exists
            if (user.skillcoins === undefined) {
                user.skillcoins = 50;
                updated = true;
            }

            // Initialize gamification fields
            if (!user.level) {
                user.level = 1;
                updated = true;
            }

            if (!user.xp) {
                user.xp = 0;
                updated = true;
            }

            if (!user.loginStreak) {
                user.loginStreak = 0;
                updated = true;
            }

            if (!user.referralCount) {
                user.referralCount = 0;
                updated = true;
            }

            // Save if updated
            if (updated) {
                // Skip validation and hooks for migration
                await User.updateOne({ _id: user._id }, user, { runValidators: false });
                logger.info(`✅ Migrated user: ${user.email}`);
            }
        }

        logger.info(`✅ Migrated ${users.length} users`);

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error migrating users:', error);
        process.exit(1);
    }
};

// Run based on command line argument
const command = process.argv[2];

if (command === 'achievements') {
    seedAchievements();
} else if (command === 'migrate-users') {
    migrateExistingUsers();
} else {
    logger.info('Usage:');
    logger.info('  node src/seedAchievements.js achievements    - Seed achievement data');
    logger.info('  node src/seedAchievements.js migrate-users   - Migrate existing users');
    process.exit(0);
}
