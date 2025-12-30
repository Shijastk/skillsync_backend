import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    Get user wallet information (SKILLCOIN ONLY - NO CASH)
// @route   GET /api/wallet
// @access  Private
export const getWalletInfo = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get transaction history
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        // Calculate stats
        const totalEarned = transactions
            .filter(t => t.type === 'earn' || t.type === 'bonus' || t.type === 'referral' || t.type === 'credit')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalSpent = transactions
            .filter(t => t.type === 'spend')
            .reduce((sum, t) => sum + t.amount, 0);

        // Get this month's earnings
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEarnings = transactions
            .filter(t =>
                (t.type === 'earn' || t.type === 'bonus' || t.type === 'referral' || t.type === 'credit') &&
                new Date(t.createdAt) >= startOfMonth
            )
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            skillcoins: user.skillcoins,
            stats: {
                totalEarned,
                totalSpent,
                thisMonthEarnings,
                available: user.skillcoins // All skillcoins are always available (no escrow in skillcoin economy)
            },
            transactions,
            message: '💡 Skillcoins can only be earned through platform activity - no cash purchases allowed!'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get skillcoin earning opportunities
// @route   GET /api/wallet/earning-opportunities
// @access  Private
export const getEarningOpportunities = async (req, res) => {
    try {
        const user = req.user;

        const opportunities = [
            {
                type: 'swap_complete',
                title: 'Complete a Skill Swap',
                description: 'Exchange skills with other users',
                reward: 50,
                icon: '🔄',
                available: true
            },
            {
                type: 'profile_complete',
                title: 'Complete Your Profile',
                description: 'Add bio, skills, and avatar',
                reward: 20,
                icon: '👤',
                available: !user.bio || user.skillsToTeach.length === 0
            },
            {
                type: 'login_streak_7',
                title: '7-Day Login Streak',
                description: 'Log in for 7 consecutive days',
                reward: 50,
                icon: '🔥',
                available: user.loginStreak < 7,
                progress: user.loginStreak
            },
            {
                type: 'referral',
                title: 'Refer a Friend',
                description: 'Invite friends using your referral code',
                reward: 100,
                icon: '🎁',
                available: true,
                referralCode: user.referralCode
            },
            {
                type: 'post_create',
                title: 'Share Knowledge',
                description: 'Create helpful community posts',
                reward: 5,
                icon: '📝',
                available: true
            },
            {
                type: 'milestone_10_swaps',
                title: '10 Swaps Milestone',
                description: 'Complete your 10th swap',
                reward: 100,
                icon: '🏆',
                available: user.completedSwaps < 10,
                progress: user.completedSwaps
            }
        ];

        res.json({ opportunities });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Spend skillcoins (for premium features only)
// @route   POST /api/wallet/spend
// @access  Private
export const spendSkillcoins = async (req, res) => {
    try {
        const { amount, description, feature } = req.body;
        const user = req.user;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        if (user.skillcoins < amount) {
            return res.status(400).json({ message: 'Insufficient skillcoins' });
        }

        // Spend skillcoins
        await user.spendSkillcoins(amount);

        // Create transaction
        await Transaction.create({
            user: user._id,
            type: 'spend',
            amount,
            description: description || `Spent on ${feature}`,
            source: { type: 'spend' },
            balance: user.skillcoins
        });

        res.json({
            success: true,
            newBalance: user.skillcoins,
            message: `Spent ${amount} skillcoins`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
