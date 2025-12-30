import Post from '../models/post.model.js';

// @desc    Create a post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res) => {
    try {
        const { content, groupId } = req.body;
        let image = req.body.image;
        const Transaction = (await import('../models/transaction.model.js')).default;
        const User = (await import('../models/user.model.js')).default;

        if (req.file) {
            image = req.file.path;
        }

        const post = await Post.create({
            author: req.user._id,
            content,
            image,
            group: groupId
        });

        // GAMIFICATION: Award 5 coins for posting
        // Limit to 5 paid posts per day to prevent spam? (For now, just flat award)
        await User.findByIdAndUpdate(req.user._id, { $inc: { skillcoins: 5 } });

        await Transaction.create({
            user: req.user._id,
            type: 'earn',
            amount: 5,
            description: 'Created a community post',
            status: 'completed'
        });

        // Populate author and return clean JSON
        await post.populate('author', 'firstName lastName avatar');

        // Convert to plain object without Mongoose internals
        res.status(201).json(post.toJSON());
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public/Private
export const getPosts = async (req, res) => {
    try {
        const { groupId } = req.query;
        let query = {};

        if (groupId) {
            query.group = groupId;
        }

        const posts = await Post.find(query)
            .populate('author', 'firstName lastName avatar')
            .populate('comments.user', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .lean(); // Return plain JavaScript objects

        res.json(posts);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Like/Unlike a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.likes.includes(req.user._id)) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            user: req.user._id,
            text
        });

        await post.save();
        await post.populate('comments.user', 'firstName lastName avatar');

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
