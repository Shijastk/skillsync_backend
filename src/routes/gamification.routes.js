import express from 'express';
import {
    getGamificationProfile,
    getLeaderboard,
    getAchievements,
    claimAchievement,
    trackActivity
} from '../controllers/gamification.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getGamificationProfile);
router.get('/leaderboard', getLeaderboard); // Public
router.get('/achievements', getAchievements); // Public
router.post('/claim/:type', protect, claimAchievement);
router.post('/activity', protect, trackActivity);

export default router;
