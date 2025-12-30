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

        // Populate creator and members with user details
        await group.populate('creator', 'firstName lastName avatar');
        await group.populate('members', 'firstName lastName avatar');

        res.status(201).json({ success: true, group: group.toJSON() });
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
            .populate('creator', 'firstName lastName avatar')
            .populate('members', 'firstName lastName avatar')
            .sort({ createdAt: -1 })
            .lean(); // Return plain objects

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
            .populate('members', 'firstName lastName avatar')
            .lean(); // Return plain object

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

        // Populate user details before sending response
        await group.populate('creator', 'firstName lastName avatar');
        await group.populate('members', 'firstName lastName avatar');

        res.json({ success: true, message: 'Joined group successfully', group: group.toJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
