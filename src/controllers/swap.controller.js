import Swap from '../models/swap.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Transaction from '../models/transaction.model.js';
import { getIO } from '../socket/socketHandler.js';
import { createNotification } from '../controllers/notification.controller.js';

// @desc    Create a new swap request
// @route   POST /api/swaps
// @access  Private
export const createSwap = async (req, res) => {
    try {
        const { recipientId, skillOffered, skillRequested, message, availability, duration, preferences } = req.body;

        // Validate recipient
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ success: false, message: 'Recipient not found' });
        }

        if (recipientId === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot swap with yourself' });
        }

        const swap = await Swap.create({
            requester: req.user._id,
            recipient: recipientId,
            skillOffered,
            skillRequested,
            description: message,
            availability,
            duration,
            preferences
        });

        // Create a new conversation for this swap request
        const conversation = await Conversation.create({
            participants: [req.user._id, recipientId],
            type: 'swap_request',
            contextId: swap._id,
            lastMessage: `Swap Request: ${skillOffered} ⇄ ${skillRequested}`,
            unreadCounts: {
                [recipientId]: 1
            }
        });

        // Create notification for recipient
        await createNotification({
            userId: recipientId,
            type: 'swap_request',
            title: 'New Swap Request',
            message: `${req.user.firstName} wants to swap ${skillOffered} for ${skillRequested}`,
            data: { swapId: swap._id, conversationId: conversation._id },
            relatedEntity: { type: 'Swap', id: swap._id },
            actionUrl: `/swaps/${swap._id}`
        });

        // Notify Recipient via Socket
        try {
            const io = getIO();
            io.to(recipientId).emit('new_swap_request', {
                swap,
                sender: {
                    id: req.user._id,
                    name: req.user.firstName + ' ' + req.user.lastName
                }
            });
        } catch (err) {
            console.error("Socket emit failed", err);
        }

        res.status(201).json({ success: true, swap, conversationId: conversation._id });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all swaps for current user
// @route   GET /api/swaps
// @access  Private
export const getMySwaps = async (req, res) => {
    try {
        const swaps = await Swap.find({
            $or: [{ requester: req.user._id }, { recipient: req.user._id }]
        })
            .populate('requester', 'firstName lastName avatar')
            .populate('recipient', 'firstName lastName avatar')
            .sort({ createdAt: -1 });

        res.json(swaps);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update swap status (accept, reject, cancel, complete)
// @route   PUT /api/swaps/:id
// @access  Private
export const updateSwapStatus = async (req, res) => {
    try {
        const { status } = req.body; // accepted, rejected, cancelled, completed
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'firstName lastName')
            .populate('recipient', 'firstName lastName');

        if (!swap) {
            return res.status(404).json({ success: false, message: 'Swap not found' });
        }

        // Auth check: only participants can update
        if (swap.requester._id.toString() !== req.user._id.toString() && swap.recipient._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const oldStatus = swap.status;
        swap.status = status;
        await swap.save();

        // Determine other user
        const otherUser = swap.requester._id.toString() === req.user._id.toString()
            ? swap.recipient
            : swap.requester;
        const otherUserId = otherUser._id.toString();

        // Create notifications based on status
        let notificationData = {};
        switch (status) {
            case 'accepted':
                notificationData = {
                    userId: otherUserId,
                    type: 'swap_accepted',
                    title: 'Swap Accepted!',
                    message: `${req.user.firstName} accepted your swap request`,
                    data: { swapId: swap._id },
                    relatedEntity: { type: 'Swap', id: swap._id },
                    actionUrl: `/swaps/${swap._id}`
                };
                break;
            case 'rejected':
                notificationData = {
                    userId: otherUserId,
                    type: 'swap_rejected',
                    title: 'Swap Declined',
                    message: `${req.user.firstName} declined your swap request`,
                    data: { swapId: swap._id },
                    relatedEntity: { type: 'Swap', id: swap._id },
                    actionUrl: `/swaps`
                };
                break;
            case 'completed':
                // Handle credit transactions
                if (oldStatus !== 'completed') {
                    const creditAmount = 50;

                    await Transaction.create([
                        {
                            user: swap.requester._id,
                            type: 'credit',
                            amount: creditAmount,
                            description: `Completed swap with ${swap.recipient.firstName || 'user'}`,
                            swapId: swap._id,
                            status: 'completed'
                        },
                        {
                            user: swap.recipient._id,
                            type: 'credit',
                            amount: creditAmount,
                            description: `Completed swap with ${swap.requester.firstName || 'user'}`,
                            swapId: swap._id,
                            status: 'completed'
                        }
                    ]);

                    await User.findByIdAndUpdate(swap.requester._id, { $inc: { credits: creditAmount } });
                    await User.findByIdAndUpdate(swap.recipient._id, { $inc: { credits: creditAmount } });

                    // Notify both users
                    await createNotification({
                        userId: otherUserId,
                        type: 'swap_completed',
                        title: 'Swap Completed!',
                        message: `You earned ${creditAmount} credits from swap with ${req.user.firstName}`,
                        data: { swapId: swap._id, creditsEarned: creditAmount },
                        relatedEntity: { type: 'Swap', id: swap._id },
                        actionUrl: `/wallet`
                    });
                }
                break;
        }

        if (notificationData.userId) {
            await createNotification(notificationData);
        }

        // Notify other party via Socket
        try {
            const io = getIO();
            io.to(otherUserId).emit('swap_status_update', {
                swapId: swap._id,
                status: status
            });
        } catch (err) {
            console.error("Socket emit failed", err);
        }

        res.json({ success: true, swap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
