import express from 'express';
import { getConversations, getMessages } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.get('/:conversationId/messages', getMessages);

export default router;
