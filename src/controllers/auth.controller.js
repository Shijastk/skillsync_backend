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
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            const accessToken = generateAccessToken(user._id);
            const refreshToken = await createRefreshToken(user._id, req.ip);

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
    const { firstName, lastName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        });

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
