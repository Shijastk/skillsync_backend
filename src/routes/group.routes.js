import express from 'express';
import { createGroup, getGroups, getGroupById, joinGroup } from '../controllers/group.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
    .get(getGroups)
    .post(protect, createGroup);

router.route('/:id')
    .get(getGroupById);

router.route('/:id/join')
    .post(protect, joinGroup);

export default router;
