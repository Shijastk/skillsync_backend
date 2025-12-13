import User from '../models/user.model.js';
import Swap from '../models/swap.model.js';
import Post from '../models/post.model.js';
import Group from '../models/group.model.js';
import { cache } from '../utils/cache.js';

// @desc    Universal search across all entities
// @route   GET /api/search
// @access  Public
export const universalSearch = async (req, res) => {
    try {
        const { q: query, type, limit = 10, page = 1 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        const searchQuery = query.trim();
        const cacheKey = `search:${searchQuery}:${type}:${page}:${limit}`;

        // Check cache
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const results = {};
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Search regex (case-insensitive)
        const regex = new RegExp(searchQuery, 'i');

        // Search Users (if type not specified or type='users')
        if (!type || type === 'users') {
            const users = await User.find({
                $or: [
                    { firstName: regex },
                    { lastName: regex },
                    { email: regex },
                    { bio: regex },
                    { location: regex },
                    { 'skillsToTeach.name': regex },
                    { 'skillsToLearn.name': regex }
                ],
                isActive: true
            })
                .select('-password')
                .limit(parseInt(limit))
                .skip(skip)
                .sort({ createdAt: -1 });

            results.users = {
                data: users,
                count: users.length,
                total: await User.countDocuments({
                    $or: [
                        { firstName: regex },
                        { lastName: regex },
                        { bio: regex }
                    ],
                    isActive: true
                })
            };
        }

        // Search Swaps
        if (!type || type === 'swaps') {
            const swaps = await Swap.find({
                $or: [
                    { skillOffered: regex },
                    { skillRequested: regex },
                    { description: regex }
                ]
            })
                .populate('requester recipient', 'firstName lastName avatar')
                .limit(parseInt(limit))
                .skip(skip)
                .sort({ createdAt: -1 });

            results.swaps = {
                data: swaps,
                count: swaps.length,
                total: await Swap.countDocuments({
                    $or: [
                        { skillOffered: regex },
                        { skillRequested: regex }
                    ]
                })
            };
        }

        // Search Posts
        if (!type || type === 'posts') {
            const posts = await Post.find({
                $or: [
                    { content: regex }
                ]
            })
                .populate('author', 'firstName lastName avatar')
                .limit(parseInt(limit))
                .skip(skip)
                .sort({ createdAt: -1 });

            results.posts = {
                data: posts,
                count: posts.length,
                total: await Post.countDocuments({ content: regex })
            };
        }

        // Search Groups
        if (!type || type === 'groups') {
            const groups = await Group.find({
                $or: [
                    { name: regex },
                    { description: regex },
                    { category: regex }
                ]
            })
                .populate('creator', 'firstName lastName')
                .limit(parseInt(limit))
                .skip(skip)
                .sort({ createdAt: -1 });

            results.groups = {
                data: groups,
                count: groups.length,
                total: await Group.countDocuments({
                    $or: [
                        { name: regex },
                        { description: regex }
                    ]
                })
            };
        }

        // Calculate total results
        const totalResults = Object.values(results).reduce((sum, r) => sum + r.count, 0);

        const response = {
            query: searchQuery,
            total: totalResults,
            page: parseInt(page),
            limit: parseInt(limit),
            results
        };

        // Cache for 5 minutes
        cache.set(cacheKey, response, 300);

        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get search suggestions/autocomplete
// @route   GET /api/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
    try {
        const { q: query, limit = 5 } = req.query;

        if (!query || query.trim().length < 2) {
            return res.json({ suggestions: [] });
        }

        const searchQuery = query.trim();
        const regex = new RegExp(`^${searchQuery}`, 'i');

        // Get skill suggestions (most common)
        const skillSuggestions = await User.aggregate([
            { $unwind: '$skillsToTeach' },
            { $match: { 'skillsToTeach.name': regex } },
            { $group: { _id: '$skillsToTeach.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: parseInt(limit) },
            { $project: { suggestion: '$_id', type: { $literal: 'skill' }, count: 1 } }
        ]);

        // Get user name suggestions
        const userSuggestions = await User.find({
            $or: [
                { firstName: regex },
                { lastName: regex }
            ],
            isActive: true
        })
            .select('firstName lastName')
            .limit(parseInt(limit));

        const userSuggestionsMapped = userSuggestions.map(u => ({
            suggestion: `${u.firstName} ${u.lastName}`,
            type: 'user',
            id: u._id
        }));

        const suggestions = [
            ...skillSuggestions.map(s => ({ ...s, _id: undefined })),
            ...userSuggestionsMapped
        ].slice(0, parseInt(limit));

        res.json({ suggestions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
