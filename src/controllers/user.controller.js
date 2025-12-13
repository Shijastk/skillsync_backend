import User from '../models/user.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { cache, invalidateCache } from '../utils/cache.js';

// @desc    Get all users (with caching)
// @route   GET /api/users
// @access  Public (or Protected)
export const getUsers = async (req, res) => {
    try {
        const { search, skill, location, page = 1, limit = 50 } = req.query;

        // Build cache key
        const cacheKey = `users:${search || ''}:${skill || ''}:${location || ''}:${page}:${limit}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        if (skill) {
            query['skillsToTeach.name'] = { $regex: skill, $options: 'i' };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        const result = {
            users,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        };

        // Cache for 5 minutes
        cache.set(cacheKey, result, 300);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
    try {
        const cacheKey = `user:${req.params.id}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const user = await User.findById(req.params.id).select('-password');

        if (user) {
            cache.set(cacheKey, user, 300);
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.bio = req.body.bio || user.bio;
            user.location = req.body.location || user.location;

            // Handle array updates
            if (req.body.skillsToTeach) {
                user.skillsToTeach = typeof req.body.skillsToTeach === 'string'
                    ? JSON.parse(req.body.skillsToTeach)
                    : req.body.skillsToTeach;
            }

            if (req.body.skillsToLearn) {
                user.skillsToLearn = typeof req.body.skillsToLearn === 'string'
                    ? JSON.parse(req.body.skillsToLearn)
                    : req.body.skillsToLearn;
            }

            // Handle Image Upload
            if (req.file) {
                user.avatar = req.file.path;
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Invalidate cache
            invalidateCache(`user:${user._id}`);
            invalidateCache('users:');

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            res.json({
                success: true,
                user: userResponse
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Public
export const getUserStats = async (req, res) => {
    try {
        const userId = req.params.id;
        const cacheKey = `user:stats:${userId}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const [user, swapsRequested, swapsReceived] = await Promise.all([
            User.findById(userId).select('credits createdAt'),
            // Import Swap model if needed, for now returning mock data
            Promise.resolve([]),
            Promise.resolve([])
        ]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const stats = {
            totalSwaps: swapsRequested.length + swapsReceived.length,
            completedSwaps: 0, // Calculate from swap status
            credits: user.credits,
            memberSince: user.createdAt,
            successRate: '100%' // Calculate based on completed vs total
        };

        cache.set(cacheKey, stats, 600); // Cache for 10 minutes

        res.json(stats);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
