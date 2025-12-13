import express from 'express';
import { getReferralCode, getReferralStats, applyReferralCode } from '../controllers/referral.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/code', protect, getReferralCode);
router.get('/stats', protect, getReferralStats);
router.post('/apply', applyReferralCode); // Public (called during registration)

export default router;
