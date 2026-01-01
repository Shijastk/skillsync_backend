import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    createdByIp: { type: String },
    revoked: { type: Boolean, default: false },
    revokedAt: { type: Date },
    revokedByIp: { type: String },
    replacedByToken: { type: String }
}, {
    timestamps: true
});

// Index for cleanup of expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user: 1 });


const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
export default RefreshToken;
