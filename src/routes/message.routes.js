import express from 'express';
import { sendMessage, markMessageAsRead } from '../controllers/message.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(protect);

// Send message with optional media attachment
// Supports: text, image, voice, video, file
router.post('/', upload.single('attachment'), sendMessage);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

export default router;
