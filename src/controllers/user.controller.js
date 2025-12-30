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

        // Exclude current user if authenticated
        if (req.user && req.user._id) {
            query._id = { $ne: req.user._id };
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { 'skillsToTeach.title': { $regex: search, $options: 'i' } } // Also search skills with general search
            ];
        }

        if (skill) {
            query['skillsToTeach.title'] = { $regex: skill, $options: 'i' };
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const users = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 })
            .lean();

        const total = await User.countDocuments(query);

        // If no matches found, provide unmatches (recommendations)
        // We fetching "unmatches" if the result list is empty, regardless of filters
        let unmatches = [];
        if (users.length === 0) {
            const unmatchQuery = req.user ? { _id: { $ne: req.user._id } } : {};
            unmatches = await User.find(unmatchQuery)
                .select('-password')
                .limit(20)
                .sort({ createdAt: -1 })
                .lean();
        }

        const result = {
            users,
            unmatches,
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

        const user = await User.findById(req.params.id)
            .select('-password')
            .lean(); // Return plain object

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
        const Transaction = (await import('../models/transaction.model.js')).default; // Dynamic import to avoid cycles depending on structure

        if (user) {
            // Check previous state for gamification
            const wasProfileComplete = user.bio && user.skillsToTeach && user.skillsToTeach.length > 0;

            user.firstName = req.body.firstName || user.firstName;
            user.lastName = req.body.lastName || user.lastName;
            user.bio = req.body.bio || user.bio;
            user.location = req.body.location || user.location;
            user.role = req.body.role || user.role;

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

            // GAMIFICATION: Check if profile is now complete
            const isProfileNowComplete = user.bio && user.skillsToTeach && user.skillsToTeach.length > 0;

            if (!wasProfileComplete && isProfileNowComplete) {
                // Award coins
                user.skillcoins = (user.skillcoins || 0) + 20;

                // Log transaction
                await Transaction.create({
                    user: user._id,
                    type: 'bonus',
                    amount: 20,
                    description: 'Profile Completion Bonus',
                    status: 'completed'
                });
            }

            const updatedUser = await user.save();

            // Invalidate cache
            invalidateCache(`user:${user._id}`);
            invalidateCache('users:');

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            // Add flag to response so frontend can show celebration
            if (!wasProfileComplete && isProfileNowComplete) {
                userResponse.justCompletedProfile = true;
            }

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

// @desc    Add skill to teach
// @route   POST /api/users/skills/teach
// @access  Private
export const addSkillToTeach = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate required fields
        const { title, description, category, experienceLevel } = req.body;
        if (!title || !description || !category || !experienceLevel) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, category, and experience level are required'
            });
        }

        // Check if skill already exists
        const existingSkill = user.skillsToTeach.find(
            skill => skill.title.toLowerCase() === title.toLowerCase()
        );

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                message: 'You already have this skill in your teaching list'
            });
        }

        // Add new skill
        user.skillsToTeach.push(req.body);
        await user.save();

        // Invalidate cache
        invalidateCache(`user:${user._id}`);
        invalidateCache('users:');

        res.status(201).json({
            success: true,
            skill: user.skillsToTeach[user.skillsToTeach.length - 1],
            message: 'Skill added successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add skill to learn
// @route   POST /api/users/skills/learn
// @access  Private
export const addSkillToLearn = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Validate required fields
        const { title, description, category, experienceLevel } = req.body;
        if (!title || !description || !category || !experienceLevel) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, category, and experience level are required'
            });
        }

        // Check if skill already exists
        const existingSkill = user.skillsToLearn.find(
            skill => skill.title.toLowerCase() === title.toLowerCase()
        );

        if (existingSkill) {
            return res.status(400).json({
                success: false,
                message: 'You already have this skill in your learning list'
            });
        }

        // Add new skill
        user.skillsToLearn.push(req.body);
        await user.save();

        // Invalidate cache
        invalidateCache(`user:${user._id}`);
        invalidateCache('users:');

        res.status(201).json({
            success: true,
            skill: user.skillsToLearn[user.skillsToLearn.length - 1],
            message: 'Learning goal added successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove skill to teach
// @route   DELETE /api/users/skills/teach/:skillId
// @access  Private
export const removeSkillToTeach = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const skillId = req.params.skillId;
        const initialLength = user.skillsToTeach.length;

        user.skillsToTeach = user.skillsToTeach.filter(
            skill => skill._id.toString() !== skillId
        );

        if (user.skillsToTeach.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Skill not found'
            });
        }

        await user.save();

        // Invalidate cache
        invalidateCache(`user:${user._id}`);
        invalidateCache('users:');

        res.json({
            success: true,
            message: 'Skill removed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Remove skill to learn
// @route   DELETE /api/users/skills/learn/:skillId
// @access  Private
export const removeSkillToLearn = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const skillId = req.params.skillId;
        const initialLength = user.skillsToLearn.length;

        user.skillsToLearn = user.skillsToLearn.filter(
            skill => skill._id.toString() !== skillId
        );

        if (user.skillsToLearn.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Learning goal not found'
            });
        }

        await user.save();

        // Invalidate cache
        invalidateCache(`user:${user._id}`);
        invalidateCache('users:');

        res.json({
            success: true,
            message: 'Learning goal removed successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

