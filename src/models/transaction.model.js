import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['earn', 'spend', 'bonus', 'referral'], required: true }, // Changed from credit/debit
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    source: {
        type: { type: String, enum: ['swap', 'activity', 'referral', 'bonus', 'milestone', 'level_up'] },
        id: { type: mongoose.Schema.Types.ObjectId } // Reference to source (swap, activity, etc.)
    },
    balance: { type: Number }, // Balance after transaction
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
}, {
    timestamps: true
});

// Index for fast queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
