import Transaction from '../models/transaction.model.js';

// @desc    Get current user transactions
// @route   GET /api/transactions
// @access  Private
export const getMyTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
