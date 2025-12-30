import express from 'express';
import { createSwap, getMySwaps, updateSwapStatus, getSwapById } from '../controllers/swap.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { swapValidation, validate } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(protect); // All routes protected

router.route('/')
    .get(getMySwaps)
    .post(swapValidation, validate, createSwap);

router.route('/:id')
    .get(getSwapById)
    .put(updateSwapStatus);

export default router;
