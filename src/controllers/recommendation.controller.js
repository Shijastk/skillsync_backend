import User from '../models/user.model.js';
import Swap from '../models/swap.model.js';
import Post from '../models/post.model.js';

// Calculate match score between two users based on skills
// Calculate match score between two users based on skills
const calculateMatchScore = (currentUser, otherUser) => {
    let score = 0;

    const currentTeaches = (currentUser.skillsToTeach || []).map(s => s.title.toLowerCase());
    const currentLearns = (currentUser.skillsToLearn || []).map(s => s.title.toLowerCase());
    const otherTeaches = (otherUser.skillsToTeach || []).map(s => s.title.toLowerCase());
    const otherLearns = (otherUser.skillsToLearn || []).map(s => s.title.toLowerCase());

    // 1. Perfect Two-Way Match (Direct Swap)
    // I teach what they want AND they teach what I want
    const iTeachTheyWant = currentTeaches.some(skill => otherLearns.includes(skill));
    const theyTeachIWant = otherTeaches.some(skill => currentLearns.includes(skill));

    if (iTeachTheyWant && theyTeachIWant) {
        return 95 + Math.floor(Math.random() * 5); // 95-100% (Perfect)
    }

    // 2. One-Way Match
    if (theyTeachIWant) {
        score = 85; // High relevance (they can teach me)
    } else if (iTeachTheyWant) {
        score = 75; // Moderate relevance (I can teach them)
    } else {
        // 3. Category/Interest Match
        // Check if we are interested in similar broader categories
        const myInterestCats = (currentUser.skillsToLearn || []).map(s => s.category);
        const theirTeachCats = (otherUser.skillsToTeach || []).map(s => s.category);

        const categoryMatch = myInterestCats.some(cat => theirTeachCats.includes(cat));
        if (categoryMatch) {
            score = 60;
        } else {
            score = 20 + Math.floor(Math.random() * 30); // Random low score 20-50 for non-matches
        }
    }

    // 4. Bonuses
    // Active recently?
    if (otherUser.lastLoginAt && new Date() - new Date(otherUser.lastLoginAt) < 7 * 24 * 60 * 60 * 1000) {
        score += 5;
    }

    return Math.min(score, 100);
};

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations
// @access  Private
export const getRecommendations = async (req, res) => {
    try {
        const currentUser = req.user;
        const { type = 'users', limit = 10, page = 1 } = req.query;

        // CACHE KEY: Differentiate by type, user, limit, and page
        const cacheKey = `recommendations:${currentUser._id}:${type}:${limit}:${page}`;
        const { cache } = await import('../utils/cache.js'); // Dynamic import
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached); // Instant return
        }

        if (type === 'users') {
            // ... (User matching logic stays mostly same but optimized) ...

            // Get user's active/pending swaps to exclude
            const existingSwaps = await Swap.find({
                $or: [{ requester: currentUser._id }, { recipient: currentUser._id }],
                status: { $in: ['pending', 'accepted', 'active'] }
            }).select('requester recipient').lean();

            const excludedIds = new Set([
                currentUser._id.toString(),
                ...existingSwaps.flatMap(s => [s.requester.toString(), s.recipient.toString()])
            ]);

            // Find potential matches using Index-optimized query
            // We look for users who TEACH what I LEARN or LEARN what I TEACH
            const myInterests = currentUser.skillsToLearn.map(s => s.title);
            const mySkills = currentUser.skillsToTeach.map(s => s.title);

            // Fetch candidates (limit to 100 for performance scoring)
            const candidates = await User.find({
                _id: { $nin: Array.from(excludedIds) },
                isActive: true,
                $or: [
                    { 'skillsToTeach.title': { $in: myInterests } },
                    { 'skillsToLearn.title': { $in: mySkills } }
                ]
            })
                .select('-password -email')
                .limit(100)
                .lean();

            // Score them (CPU intensive task - keep dataset small)
            const scored = candidates
                .map(u => ({ ...u, matchScore: calculateMatchScore(currentUser, u) }))
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, parseInt(limit));

            const response = { recommendations: scored, total: scored.length };
            cache.set(cacheKey, response, 300); // Cache for 5 mins
            return res.json(response);

        } else if (type === 'feed') {
            // --- HIGH PERFORMANCE PERSONALIZED FEED ---

            const myInterests = (currentUser.skillsToLearn || []).map(s => s.title);

            // 1. Get IDs of users who are relevant (Teach what I want)
            // This leverages the new 'skillsToTeach.title' index
            const relevantUsersPromise = User.find({
                'skillsToTeach.title': { $in: myInterests }
            }).select('_id').distinct('_id'); // Get distinct IDs only

            // 2. Get Trending Posts (Global fallback)
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const [relevantUserIds] = await Promise.all([relevantUsersPromise]);

            // 3. Main Feed Query: Posts from Relevant Users OR containing keywords
            const posts = await Post.find({
                $or: [
                    { author: { $in: relevantUserIds } }, // Posts by relevant people
                    { author: currentUser._id } // My own posts
                ]
            })
                .populate('author', 'firstName lastName avatar level')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit))
                .lean(); // Faster

            // 4. If fewer than limit, fill with Trending content
            if (posts.length < parseInt(limit)) {
                const fillCount = parseInt(limit) - posts.length;
                const trendingPosts = await Post.find({
                    _id: { $nin: posts.map(p => p._id) },
                    createdAt: { $gte: oneWeekAgo }
                })
                    .populate('author', 'firstName lastName avatar level')
                    .sort({ 'likes.length': -1 }) // Sort by popularity
                    .limit(fillCount)
                    .lean();

                posts.push(...trendingPosts);
            }

            const response = { recommendations: posts, total: posts.length };
            cache.set(cacheKey, response, 60); // Cache feed for 1 minute
            res.json(response);
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
                        _id: '$skillsToLearn.title',
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
