import express from 'express';
import {
    getUsers,
    getUserById,
    updateUserProfile,
    getUserStats,
    addSkillToTeach,
    addSkillToLearn,
    removeSkillToTeach,
    removeSkillToLearn
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);

// Skill management routes
router.post('/skills/teach', protect, addSkillToTeach);
router.post('/skills/learn', protect, addSkillToLearn);
router.delete('/skills/teach/:skillId', protect, removeSkillToTeach);
router.delete('/skills/learn/:skillId', protect, removeSkillToLearn);

router.get('/:id', getUserById);
router.get('/:id/stats', getUserStats);

export default router;

