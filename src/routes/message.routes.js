import express from 'express';
import { sendMessage, markMessageAsRead } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.post('/', sendMessage);
router.put('/:messageId/read', markMessageAsRead);

export default router;

