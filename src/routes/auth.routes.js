import express from 'express';
import {
    loginUser,
    registerUser,
    getCurrentUser,
    logoutUser,
    refreshAccessToken,
    revokeToken,
    getUserTokens
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.middleware.js';
import { loginValidation, registerValidation, validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/login', authLimiter, loginValidation, validate, loginUser);
router.post('/register', authLimiter, registerValidation, validate, registerUser);
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh-token', refreshAccessToken); // Public - uses refresh token
router.post('/revoke-token', revokeToken); // Public - for security (can revoke own token)
router.get('/tokens', protect, getUserTokens); // Get active sessions

export default router;
