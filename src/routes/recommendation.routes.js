import express from 'express';
import { getRecommendations, getTrending } from '../controllers/recommendation.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getRecommendations);
router.get('/trending', getTrending); // Public

export default router;
