import express from 'express';
import { getPlatformStats, getLeaderboard, getActivityFeed } from '../controllers/stats.controller.js';
import { cacheMiddleware } from '../utils/cache.js';

const router = express.Router();

// All routes are public and cached
router.get('/platform', cacheMiddleware(600), getPlatformStats);
router.get('/leaderboard', cacheMiddleware(600), getLeaderboard);
router.get('/activity', cacheMiddleware(300), getActivityFeed);

export default router;
