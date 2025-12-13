import express from 'express';
import { createPost, getPosts, likePost, addComment } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { postValidation, validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.route('/')
    .get(getPosts)
    .post(protect, upload.single('image'), postValidation, validate, createPost);

router.route('/:id/like')
    .put(protect, likePost);

router.route('/:id/comment')
    .post(protect, addComment);

export default router;
