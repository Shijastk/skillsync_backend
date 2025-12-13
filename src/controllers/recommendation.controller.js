import User from '../models/user.model.js';
import Swap from '../models/swap.model.js';
import Post from '../models/post.model.js';

// Calculate match score between two users based on skills
const calculateMatchScore = (currentUser, otherUser) => {
    let score = 0;

    const currentTeaches = new Set((currentUser.skillsToTeach || []).map(s => s.name.toLowerCase()));
    const currentLearns = new Set((currentUser.skillsToLearn || []).map(s => s.name.toLowerCase()));
    const otherTeaches = new Set((otherUser.skillsToTeach || []).map(s => s.name.toLowerCase()));
    const otherLearns = new Set((otherUser.skillsToLearn || []).map(s => s.name.toLowerCase()));

    // Perfect match: they teach what I want to learn, and I teach what they want to learn
    currentLearns.forEach(skill => {
        if (otherTeaches.has(skill)) score += 40;
    });

    otherLearns.forEach(skill => {
        if (currentTeaches.has(skill)) score += 40;
    });

    // Partial match: similar interests
    currentLearns.forEach(skill => {
        if (otherLearns.has(skill)) score += 10;
    });

    currentTeaches.forEach(skill => {
        if (otherTeaches.has(skill)) score += 5;
    });

    return Math.min(score, 100); // Cap at 100
};

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        const currentUser = req.user;
        const { type = 'users', limit = 10 } = req.query;

        if (type === 'users') {
            // Get all other users
            const users = await User.find({
                _id: { $ne: currentUser._id },
                isActive: true
            }).select('-password');

            // Get user's existing swaps to filter out
            const existingSwaps = await Swap.find({
                $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
                status: { $in: ['pending', 'accepted', 'active'] }
            });

            const swappedUserIds = new Set(
                existingSwaps.flatMap(s => [s.requester.toString(), s.recipient.toString()])
            );

            // Calculate scores and filter
            const recommendations = users
                .filter(u => !swappedUserIds.has(u._id.toString()))
                .map(u => ({
                    ...u.toObject(),
                    matchScore: calculateMatchScore(currentUser, u)
                }))
                .filter(u => u.matchScore > 0) // Only show matches
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, parseInt(limit));

            res.json({ recommendations, total: recommendations.length });
        } else if (type === 'feed') {
            // Personalized feed based on interests
            const userInterests = (currentUser.skillsToLearn || []).map(s => s.name);
            const userSkills = (currentUser.skillsToTeach || []).map(s => s.name);
            const allTags = [...userInterests, ...userSkills];

            // Get posts from users with matching skills
            const relevantUsers = await User.find({
                _id: { $ne: currentUser._id },
                $or: [
                    { 'skillsToTeach.name': { $in: userInterests } },
                    { 'skillsToLearn.name': { $in: userSkills } }
                ]
            }).select('_id');

            const relevantUserIds = relevantUsers.map(u => u._id);

            const posts = await Post.find({
                $or: [
                    { author: { $in: relevantUserIds } },
                    // Could add tag matching if posts had tags
                ]
            })
                .populate('author', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            res.json({ recommendations: posts, total: posts.length });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get trending/popular content
// @route   GET /api/recommendations/trending
// @access  Public
export const getTrending = async (req, res) => {
    try {
        const { type = 'posts', timeframe = 'week' } = req.query;

        let dateFilter = new Date();
        switch (timeframe) {
            case 'day':
                dateFilter.setDate(dateFilter.getDate() - 1);
                break;
            case 'week':
                dateFilter.setDate(dateFilter.getDate() - 7);
                break;
            case 'month':
                dateFilter.setMonth(dateFilter.getMonth() - 1);
                break;
        }

        if (type === 'posts') {
            const trending = await Post.find({
                createdAt: { $gte: dateFilter }
            })
                .populate('author', 'firstName lastName avatar')
                .sort({ 'likes.length': -1, 'comments.length': -1 })
                .limit(10);

            res.json({ trending });
        } else if (type === 'skills') {
            // Aggregate most sought-after skills
            const skillsAggregation = await User.aggregate([
                { $unwind: '$skillsToLearn' },
                {
                    $group: {
                        _id: '$skillsToLearn.name',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 20 }
            ]);

            res.json({ trending: skillsAggregation });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
