import User from '../models/user.model.js';
import Swap from '../models/swap.model.js';
import Post from '../models/post.model.js';
import Group from '../models/group.model.js';
import { cache } from '../utils/cache.js';

// @desc    Get platform statistics
// @route   GET /api/stats/platform
// @access  Public
export const getPlatformStats = async (req, res) => {
    try {
        const cacheKey = 'stats:platform';
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const [
            totalUsers,
            activeUsers,
            totalSwaps,
            completedSwaps,
            totalGroups,
            totalPosts
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ isActive: true }),
            Swap.countDocuments(),
            Swap.countDocuments({ status: 'completed' }),
            Group.countDocuments(),
            Post.countDocuments()
        ]);

        // Get trending skills
        const trendingSkills = await User.aggregate([
            { $unwind: '$skillsToLearn' },
            { $group: { _id: '$skillsToLearn.name', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get most active users (by swap count)
        const topSwappers = await Swap.aggregate([
            {
                $facet: {
                    requesters: [
                        { $group: { _id: '$requester', count: { $sum: 1 } } }
                    ],
                    recipients: [
                        { $group: { _id: '$recipient', count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        const stats = {
            overview: {
                totalUsers,
                activeUsers,
                totalSwaps,
                completedSwaps,
                totalGroups,
                totalPosts,
                successRate: totalSwaps > 0 ? `${Math.round((completedSwaps / totalSwaps) * 100)}%` : '0%'
            },
            trending: {
                skills: trendingSkills.map(s => ({ name: s._id, demand: s.count }))
            },
            growth: {
                // Could add time-series data here
                usersThisMonth: activeUsers, // Simplified
                swapsThisMonth: totalSwaps
            }
        };

        cache.set(cacheKey, stats, 600); // Cache for 10 minutes

        res.json(stats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get community leaderboard
// @route   GET /api/stats/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
    try {
        const { type = 'swaps', limit = 10 } = req.query;
        const cacheKey = `stats:leaderboard:${type}:${limit}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        let leaderboard = [];

        if (type === 'swaps') {
            // Most active swappers
            const swapCounts = await Swap.aggregate([
                {
                    $facet: {
                        requesters: [
                            { $group: { _id: '$requester', count: { $sum: 1 } } }
                        ],
                        recipients: [
                            { $group: { _id: '$recipient', count: { $sum: 1 } } }
                        ]
                    }
                }
            ]);

            // Combine and count
            const userSwapCounts = new Map();
            [...swapCounts[0].requesters, ...swapCounts[0].recipients].forEach(item => {
                const current = userSwapCounts.get(item._id.toString()) || 0;
                userSwapCounts.set(item._id.toString(), current + item.count);
            });

            // Get top users
            const topUserIds = Array.from(userSwapCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, parseInt(limit))
                .map(([userId]) => userId);

            const users = await User.find({ _id: { $in: topUserIds } }).select('firstName lastName avatar');

            leaderboard = topUserIds.map((userId, index) => {
                const user = users.find(u => u._id.toString() === userId);
                return {
                    rank: index + 1,
                    user: user ? {
                        id: user._id,
                        name: `${user.firstName} ${user.lastName}`,
                        avatar: user.avatar
                    } : null,
                    count: userSwapCounts.get(userId)
                };
            }).filter(item => item.user);
        } else if (type === 'credits') {
            // Highest credit earners
            const users = await User.find()
                .sort({ credits: -1 })
                .limit(parseInt(limit))
                .select('firstName lastName avatar credits');

            leaderboard = users.map((user, index) => ({
                rank: index + 1,
                user: {
                    id: user._id,
                    name: `${user.firstName} ${user.lastName}`,
                    avatar: user.avatar
                },
                count: user.credits
            }));
        }

        cache.set(cacheKey, leaderboard, 600);

        res.json({ leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get activity feed/timeline
// @route   GET /api/stats/activity
// @access  Public
export const getActivityFeed = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Get recent swaps, posts, and groups
        const [recentSwaps, recentPosts, recentGroups] = await Promise.all([
            Swap.find()
                .populate('requester', 'firstName lastName')
                .populate('recipient', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit) / 2),
            Post.find()
                .populate('author', 'firstName lastName avatar')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit) / 2),
            Group.find()
                .populate('creator', 'firstName lastName')
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        // Combine into activity feed
        const activities = [];

        recentSwaps.forEach(swap => {
            activities.push({
                type: 'swap',
                timestamp: swap.createdAt,
                data: {
                    requester: swap.requester ? `${swap.requester.firstName} ${swap.requester.lastName}` : 'User',
                    recipient: swap.recipient ? `${swap.recipient.firstName} ${swap.recipient.lastName}` : 'User',
                    skillOffered: swap.skillOffered,
                    skillRequested: swap.skillRequested,
                    status: swap.status
                }
            });
        });

        recentPosts.forEach(post => {
            activities.push({
                type: 'post',
                timestamp: post.createdAt,
                data: {
                    author: post.author ? `${post.author.firstName} ${post.author.lastName}` : 'User',
                    authorAvatar: post.author?.avatar,
                    content: post.content.substring(0, 100),
                    likes: post.likes?.length || 0
                }
            });
        });

        recentGroups.forEach(group => {
            activities.push({
                type: 'group',
                timestamp: group.createdAt,
                data: {
                    name: group.name,
                    creator: group.creator ? `${group.creator.firstName} ${group.creator.lastName}` : 'User',
                    memberCount: group.members?.length || 0
                }
            });
        });

        // Sort by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({ activities: activities.slice(0, parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
