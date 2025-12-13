import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Auth validation rules
export const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

export const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Swap validation rules
export const swapValidation = [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('skillOffered').trim().notEmpty().withMessage('Skill offered is required'),
    body('skillRequested').trim().notEmpty().withMessage('Skill requested is required'),
];

// Post validation rules
export const postValidation = [
    body('content').trim().notEmpty().withMessage('Content is required'),
];
