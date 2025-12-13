import express from 'express';
import { getWalletInfo, getEarningOpportunities, spendSkillcoins } from '../controllers/wallet.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // All routes protected

router.get('/', getWalletInfo);
router.get('/opportunities', getEarningOpportunities);
router.post('/spend', spendSkillcoins);

export default router;
