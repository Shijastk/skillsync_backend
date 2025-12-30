import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate Access Token (short-lived)
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '15m', // Short-lived: 15 minutes
    });
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

// Create and store refresh token in database
const createRefreshToken = async (userId, ipAddress) => {
    const token = generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const refreshToken = await RefreshToken.create({
        user: userId,
        token,
        expiresAt,
        createdByIp: ipAddress
    });

    return refreshToken.token;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const Transaction = (await import('../models/transaction.model.js')).default;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = await createRefreshToken(user._id, req.ip);

            // --- GAMIFICATION: Login Streak ---
            const now = new Date();
            const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : new Date(0);

            // Normalize to midnight to check dates
            const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const lastLoginMidnight = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

            const diffTime = Math.abs(todayMidnight - lastLoginMidnight);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consectutive day login
                user.loginStreak = (user.loginStreak || 0) + 1;

                // Weekly bonus
                if (user.loginStreak % 7 === 0) {
                    const bonus = 50;
                    user.skillcoins = (user.skillcoins || 0) + bonus;
                    await Transaction.create({
                        user: user._id,
                        type: 'bonus',
                        amount: bonus,
                        description: `${user.loginStreak} Day Login Streak!`,
                        status: 'completed'
                    });
                }
            } else if (diffDays > 1) {
                // Streak broken
                user.loginStreak = 1;
            }
            // else diffDays === 0 (same day login), do nothing

            user.lastLoginAt = now;
            await user.save();
            // ---------------------------------

            // Make response compatible with frontend
            const userResponse = user.toObject();
            delete userResponse.password;

            // Send refresh token in httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.json({
                success: true,
                user: userResponse,
                token: accessToken, // Short-lived access token
                refreshToken: refreshToken // Also send in response for mobile apps
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, referralCode } = req.body;
    const Transaction = (await import('../models/transaction.model.js')).default;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Handle Referral Logic
        let referredBy = undefined;
        let referrer = null;

        if (referralCode) {
            referrer = await User.findOne({ referralCode });
            if (referrer) {
                referredBy = referrer._id;
                referrer.referralCount = (referrer.referralCount || 0) + 1;
                // Award Referrer 100 coins
                referrer.skillcoins = (referrer.skillcoins || 0) + 100;
                await referrer.save();

                await Transaction.create({
                    user: referrer._id,
                    type: 'referral',
                    amount: 100,
                    description: `Referral Bonus: ${firstName} joined!`,
                    status: 'completed'
                });
            }
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            referredBy,
            skillcoins: referrer ? 100 : 50 // Start with 100 if referred, else 50
        });

        if (referrer) {
            await Transaction.create({
                user: user._id,
                type: 'bonus',
                amount: 50,
                description: 'Welcome Bonus (Referral Link)',
                status: 'completed'
            });
        }

        if (user) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = await createRefreshToken(user._id, req.ip);

            const userResponse = user.toObject();
            delete userResponse.password;

            // Send refresh token in httpOnly cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.status(201).json({
                success: true,
                user: userResponse,
                token: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshAccessToken = async (req, res) => {
    try {
        // Get refresh token from cookie or body
        const token = req.cookies.refreshToken || req.body.refreshToken;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Refresh token required' });
        }

        // Find refresh token in database
        const refreshToken = await RefreshToken.findOne({ token }).populate('user');

        if (!refreshToken || refreshToken.revoked) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        // Check if token is expired
        if (new Date() >= refreshToken.expiresAt) {
            return res.status(401).json({ success: false, message: 'Refresh token expired' });
        }

        // Verify user still exists
        const user = await User.findById(refreshToken.user._id);
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);

        // Optional: Implement token rotation (generate new refresh token)
        const newRefreshToken = await createRefreshToken(user._id, req.ip);

        // Revoke old refresh token
        refreshToken.revoked = true;
        refreshToken.revokedAt = new Date();
        refreshToken.revokedByIp = req.ip;
        refreshToken.replacedByToken = newRefreshToken;
        await refreshToken.save();

        // Send new refresh token in cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Revoke refresh token (logout)
// @route   POST /api/auth/revoke-token
// @access  Private
export const revokeToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken || req.body.refreshToken;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token required' });
        }

        const refreshToken = await RefreshToken.findOne({ token });

        if (!refreshToken || refreshToken.revoked) {
            return res.status(400).json({ success: false, message: 'Token not found or already revoked' });
        }

        // Revoke token
        refreshToken.revoked = true;
        refreshToken.revokedAt = new Date();
        refreshToken.revokedByIp = req.ip;
        await refreshToken.save();

        // Clear cookie
        res.clearCookie('refreshToken');

        res.json({ success: true, message: 'Token revoked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req, res) => {
    try {
        // Revoke all refresh tokens for this user
        await RefreshToken.updateMany(
            { user: req.user._id, revoked: false },
            {
                revoked: true,
                revokedAt: new Date(),
                revokedByIp: req.ip
            }
        );

        // Clear cookie
        res.clearCookie('refreshToken');

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all active refresh tokens for user (admin/user)
// @route   GET /api/auth/tokens
// @access  Private
export const getUserTokens = async (req, res) => {
    try {
        const tokens = await RefreshToken.find({
            user: req.user._id,
            revoked: false,
            expiresAt: { $gt: new Date() }
        }).select('createdByIp createdAt expiresAt');

        res.json({ success: true, tokens });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
