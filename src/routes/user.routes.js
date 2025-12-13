import express from 'express';
import { getUsers, getUserById, updateUserProfile, getUserStats } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getUsers);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);

export default router;
