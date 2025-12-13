import Group from '../models/group.model.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
    try {
        const { name, description, category, coverImage } = req.body;

        const group = await Group.create({
            name,
            description,
            category,
            coverImage,
            creator: req.user._id,
            members: [req.user._id]
        });

        res.status(201).json({ success: true, group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Public/Private
export const getGroups = async (req, res) => {
    try {
        const groups = await Group.find({})
            .populate('creator', 'firstName lastName avatar') // Populate creator details
            .populate('members', 'firstName lastName avatar') // Populate members details if needed, or just count
            .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Public/Private
export const getGroupById = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('creator', 'firstName lastName avatar')
            .populate('members', 'firstName lastName avatar'); // Need members for UI display usually

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
export const joinGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        group.members.push(req.user._id);
        await group.save();

        res.json({ success: true, message: 'Joined group successfully', group });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
