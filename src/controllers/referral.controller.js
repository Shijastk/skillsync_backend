import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import EmailQueue from '../models/emailQueue.model.js';
import ActivityLog from '../models/activityLog.model.js';

// @desc    Get user's referral code
// @route   GET /api/referrals/code
// @access  Private
export const getReferralCode = async (req, res) => {
    try {
        const user = req.user;

        res.json({
            referralCode: user.referralCode,
            referralCount: user.referralCount,
            totalEarned: user.referralCount * 100 // 100 skillcoins per referral
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get referral statistics
// @route   GET /api/referrals/stats
// @access  Private
export const getReferralStats = async (req, res) => {
    try {
        const user = req.user;

        // Get all referred users
        const referredUsers = await User.find({ referredBy: user._id })
            .select('firstName lastName createdAt completedSwaps')
            .sort({ createdAt: -1 });

        const stats = {
            totalReferrals: user.referralCount,
            totalEarned: user.referralCount * 100,
            referrals: referredUsers.map(u => ({
                name: `${u.firstName} ${u.lastName}`,
                joinedAt: u.createdAt,
                completedSwaps: u.completedSwaps,
                earnedYou: 100
            }))
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Apply referral code during registration
// @route   POST /api/referrals/apply
// @access  Public (called during registration)
export const applyReferralCode = async (req, res) => {
    try {
        const { referralCode, newUserId } = req.body;

        if (!referralCode || !newUserId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find referrer
        const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrer) {
            return res.status(404).json({ message: 'Invalid referral code' });
        }

        // Get new user
        const newUser = await User.findById(newUserId);
        if (!newUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already referred
        if (newUser.referredBy) {
            return res.status(400).json({ message: 'User already has a referrer' });
        }

        // Link referral
        newUser.referredBy = referrer._id;
        await newUser.save();

        // Update referrer stats
        referrer.referralCount += 1;
        await referrer.save();

        // Award referral bonus to referrer
        const bonusAmount = 100;
        await referrer.awardSkillcoins(bonusAmount, `Referral bonus: ${newUser.firstName} joined`);

        // Create transaction
        await Transaction.create({
            user: referrer._id,
            type: 'referral',
            amount: bonusAmount,
            description: `Referral bonus: ${newUser.firstName} ${newUser.lastName} joined`,
            source: { type: 'referral', id: newUser._id },
            balance: referrer.skillcoins
        });

        // Give new user welcome bonus
        await newUser.awardSkillcoins(20, 'Referral welcome bonus');

        // Queue emails
        await EmailQueue.create([
            {
                user: referrer._id,
                template: 'referral_bonus',
                variables: {
                    userName: referrer.firstName,
                    referredName: newUser.firstName,
                    bonus: bonusAmount,
                    newBalance: referrer.skillcoins
                }
            },
            {
                user: newUser._id,
                template: 'welcome',
                variables: {
                    userName: newUser.firstName,
                    referrerName: referrer.firstName,
                    bonus: 20,
                    referralCode: newUser.referralCode
                }
            }
        ]);

        // Track activity
        await ActivityLog.create({
            user: referrer._id,
            type: 'referral',
            skillcoinsEarned: bonusAmount,
            xpEarned: 10,
            metadata: { referredUser: newUser._id },
            processed: true
        });

        res.json({
            success: true,
            message: 'Referral applied successfully',
            referrerBonus: bonusAmount,
            newUserBonus: 20
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
