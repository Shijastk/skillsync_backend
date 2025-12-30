import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    image: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' } // Optional: if post belongs to a group
}, {
    timestamps: true
});

// Performance Indexes
postSchema.index({ author: 1, createdAt: -1 }); // Get user's posts
postSchema.index({ group: 1, createdAt: -1 }); // Get group posts
postSchema.index({ createdAt: -1 }); // Global feed / trending

const Post = mongoose.model('Post', postSchema);
export default Post;
