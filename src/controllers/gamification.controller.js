import User from '../models/user.model.js';
import Achievement from '../models/achievement.model.js';
import ActivityLog from '../models/activityLog.model.js';
import Transaction from '../models/transaction.model.js';
import EmailQueue from '../models/emailQueue.model.js';

// @desc    Get user's gamification data
// @route   GET /api/gamification/profile
// @access  Private
export const getGamificationProfile = async (req, res) => {
    try {
        const user = req.user;

        res.json({
            level: user.level,
            xp: user.xp,
            skillcoins: user.skillcoins,
            badges: user.badges,
            milestones: user.milestones,
            stats: {
                totalSwaps: user.totalSwaps,
                completedSwaps: user.completedSwaps,
                loginStreak: user.loginStreak,
                referralCount: user.referralCount
            },
            nextLevel: {
                level: user.level + 1,
                xpRequired: Math.pow(user.level + 1, 2) * 50,
                xpToGo: Math.pow(user.level + 1, 2) * 50 - user.xp
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leaderboard
// @route   GET /api/gamification/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        const { type = 'level', limit = 10 } = req.query;

        let sortField = {};
        if (type === 'level') sortField = { level: -1, xp: -1 };
        else if (type === 'skillcoins') sortField = { skillcoins: -1 };
        else if (type === 'swaps') sortField = { completedSwaps: -1 };

        const leaders = await User.find({ isActive: true })
            .select('firstName lastName avatar level xp skillcoins completedSwaps')
            .sort(sortField)
            .limit(parseInt(limit));

        const leaderboard = leaders.map((user, index) => ({
            rank: index + 1,
            user: {
                id: user._id,
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar
            },
            level: user.level,
            xp: user.xp,
            skillcoins: user.skillcoins,
            completedSwaps: user.completedSwaps
        }));

        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get available achievements
// @route   GET /api/gamification/achievements
// @access  Public
export const getAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ isActive: true });
        res.json({ achievements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Claim achievement/bonus
// @route   POST /api/gamification/claim/:type
// @access  Private
export const claimAchievement = async (req, res) => {
    try {
        const { type } = req.params;
        const user = req.user;

        // Check if already claimed
        const alreadyClaimed = user.badges.some(b => b.type === type);
        if (alreadyClaimed) {
            return res.status(400).json({ message: 'Achievement already  claimed' });
        }

        // Find achievement
        const achievement = await Achievement.findOne({ type, isActive: true });
        if (!achievement) {
            return res.status(404).json({ message: 'Achievement not found' });
        }

        // Verify requirement
        let meetsRequirement = false;
        switch (type) {
            case 'first_swap':
                meetsRequirement = user.completedSwaps >= 1;
                break;
            case 'swap_10':
                meetsRequirement = user.completedSwaps >= 10;
                break;
            case 'swap_50':
                meetsRequirement = user.completedSwaps >= 50;
                break;
            case 'swap_100':
                meetsRequirement = user.completedSwaps >= 100;
                break;
            case 'streak_7':
                meetsRequirement = user.loginStreak >= 7;
                break;
            case 'streak_30':
                meetsRequirement = user.loginStreak >= 30;
                break;
            case 'referral_5':
                meetsRequirement = user.referralCount >= 5;
                break;
            default:
                meetsRequirement = true;
        }

        if (!meetsRequirement) {
            return res.status(400).json({ message: 'Requirements not met' });
        }

        // Award achievement
        user.badges.push({
            type: achievement.type,
            name: achievement.name,
            tier: achievement.tier
        });

        // Award rewards
        if (achievement.reward.skillcoins > 0) {
            await user.awardSkillcoins(achievement.reward.skillcoins, `Achievement: ${achievement.name}`);

            await Transaction.create({
                user: user._id,
                type: 'bonus',
                amount: achievement.reward.skillcoins,
                description: `Achievement bonus: ${achievement.name}`,
                source: { type: 'bonus' },
                balance: user.skillcoins
            });
        }

        if (achievement.reward.xp > 0) {
            await user.addXP(achievement.reward.xp);
        }

        await user.save();

        // Queue email
        await EmailQueue.create({
            user: user._id,
            template: 'badge_earned',
            variables: {
                userName: user.firstName,
                badgeName: achievement.name,
                skillcoins: achievement.reward.skillcoins
            }
        });

        res.json({
            success: true,
            achievement,
            newSkillcoins: user.skillcoins,
            newXP: user.xp,
            newLevel: user.level
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Track activity
// @route   POST /api/gamification/activity
// @access  Private
export const trackActivity = async (req, res) => {
    try {
        const { type, metadata } = req.body;
        const user = req.user;

        // Define activity rewards
        const activityRewards = {
            profile_complete: { skillcoins: 20, xp: 10 },
            post_created: { skillcoins: 5, xp: 5 },
            login: { skillcoins: 0, xp: 2 }
        };

        const reward = activityRewards[type] || { skillcoins: 0, xp: 0 };

        // Check if already rewarded today (prevent spam)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingLog = await ActivityLog.findOne({
            user: user._id,
            type,
            createdAt: { $gte: today },
            processed: true
        });

        if (existingLog && type !== 'login') {
            return res.json({ message: 'Activity already tracked today' });
        }

        // Create activity log
        const activityLog = await ActivityLog.create({
            user: user._id,
            type,
            skillcoinsEarned: reward.skillcoins,
            xpEarned: reward.xp,
            metadata,
            processed: true
        });

        // Award rewards
        if (reward.skillcoins > 0) {
            await user.awardSkillcoins(reward.skillcoins, `Activity: ${type}`);

            await Transaction.create({
                user: user._id,
                type: 'earn',
                amount: reward.skillcoins,
                description: `Activity reward: ${type}`,
                source: { type: 'activity', id: activityLog._id },
                balance: user.skillcoins
            });
        }

        if (reward.xp > 0) {
            await user.addXP(reward.xp);
        }

        // Update login streak
        if (type === 'login') {
            const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
            const now = new Date();

            if (lastLogin) {
                const daysSince = Math.floor((now - lastLogin) / (24 * 60 * 60 * 1000));
                if (daysSince === 1) {
                    user.loginStreak += 1;
                } else if (daysSince > 1) {
                    user.loginStreak = 1;
                }
            } else {
                user.loginStreak = 1;
            }

            user.lastLoginAt = now;
            await user.save();
        }

        res.json({
            success: true,
            skillcoinsEarned: reward.skillcoins,
            xpEarned: reward.xp,
            newBalance: user.skillcoins,
            newXP: user.xp,
            newLevel: user.level
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
