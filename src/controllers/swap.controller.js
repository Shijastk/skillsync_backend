import Swap from '../models/swap.model.js';
import User from '../models/user.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
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

        // Create initial message so conversation isn't empty
        await Message.create({
            conversationId: conversation._id,
            sender: req.user._id,
            content: message || `Hi! I'd like to swap ${skillOffered} for ${skillRequested}. Let's discuss the details!`,
            type: 'text',
            readBy: [req.user._id]
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

        // Populate and return clean JSON
        await swap.populate('requester', 'firstName lastName avatar');
        await swap.populate('recipient', 'firstName lastName avatar');

        res.status(201).json({
            success: true,
            swap: swap.toJSON(),
            conversationId: conversation._id
        });
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
            .sort({ createdAt: -1 })
            .lean(); // Return plain objects

        res.json(swaps);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single swap by ID
// @route   GET /api/swaps/:id
// @access  Private
export const getSwapById = async (req, res) => {
    try {
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'firstName lastName avatar')
            .populate('recipient', 'firstName lastName avatar')
            .lean();

        if (!swap) {
            return res.status(404).json({ success: false, message: 'Swap not found' });
        }

        // Access check
        if (swap.requester._id.toString() !== req.user._id.toString() &&
            swap.recipient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json(swap);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update swap status (accept, reject, cancel, complete) and/or schedule
// @route   PUT /api/swaps/:id
// @access  Private
export const updateSwapStatus = async (req, res) => {
    try {
        const {
            status,
            scheduledDate,
            duration,
            sessionType,
            notes,
            preferences
        } = req.body;

        // Use lean query for faster initial fetch (no Mongoose overhead)
        const swap = await Swap.findById(req.params.id)
            .populate('requester', 'firstName lastName')
            .populate('recipient', 'firstName lastName')
            .lean(false); // We need Mongoose document for save

        if (!swap) {
            return res.status(404).json({ success: false, message: 'Swap not found' });
        }

        // Auth check: only participants can update
        if (swap.requester._id.toString() !== req.user._id.toString() && swap.recipient._id.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const oldStatus = swap.status;
        let statusChanged = false;

        // Update status if provided
        if (status) {
            swap.status = status;
            statusChanged = oldStatus !== status;
        }

        // Handle scheduling fields - OPTIMIZED
        if (scheduledDate) {
            const schedDate = new Date(scheduledDate);

            // Validate future date
            if (schedDate <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Scheduled date must be in the future'
                });
            }

            swap.scheduledDate = schedDate;

            // Auto-update status to scheduled if not already set
            if (!status || status === 'accepted') {
                swap.status = 'scheduled';
                statusChanged = true;
            }
        }

        // Update duration
        if (duration) {
            swap.duration = duration;
        }

        // Update session preferences
        if (sessionType) {
            swap.preferences = swap.preferences || {};
            swap.preferences.videoCalls = sessionType === 'video';
        }

        if (preferences) {
            swap.preferences = { ...swap.preferences, ...preferences };
        }

        // Update notes/description
        if (notes) {
            swap.description = notes;
        }

        // Save swap (mongoose pre-save hook will calculate startTime/endTime/autoExpireAt)
        await swap.save();

        // Determine other user for notifications (non-blocking)
        const otherUser = swap.requester._id.toString() === req.user._id.toString()
            ? swap.recipient
            : swap.requester;
        const otherUserId = otherUser._id.toString();

        // Async notification processing (don't await - fire and forget for speed)
        if (statusChanged || scheduledDate) {
            processSwapNotifications(swap, status, scheduledDate, otherUserId, req.user, oldStatus).catch(err => {
                console.error('Notification processing failed:', err);
            });
        }

        // Repopulate for clean response (async - don't block)
        const responseSwap = await Swap.findById(swap._id)
            .populate('requester', 'firstName lastName avatar')
            .populate('recipient', 'firstName lastName avatar')
            .lean(); // Return plain object for faster JSON serialization

        // Send response immediately (no waiting for notifications)
        res.json({ success: true, swap: responseSwap });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ASYNC NOTIFICATION PROCESSOR - Runs in background for high-speed response
async function processSwapNotifications(swap, status, scheduledDate, otherUserId, currentUser, oldStatus) {
    try {
        let notificationData = {};

        // Handle scheduled notification
        if (scheduledDate && !status) {
            notificationData = {
                userId: otherUserId,
                type: 'swap_scheduled',
                title: 'Session Scheduled!',
                message: `${currentUser.firstName} scheduled your swap session`,
                data: { swapId: swap._id, scheduledDate: swap.scheduledDate },
                relatedEntity: { type: 'Swap', id: swap._id },
                actionUrl: `/schedule`
            };
        }

        // Handle status change notifications
        switch (status) {
            case 'accepted':
                notificationData = {
                    userId: otherUserId,
                    type: 'swap_accepted',
                    title: 'Swap Accepted!',
                    message: `${currentUser.firstName} accepted your swap request`,
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
                    message: `${currentUser.firstName} declined your swap request`,
                    data: { swapId: swap._id },
                    relatedEntity: { type: 'Swap', id: swap._id },
                    actionUrl: `/swaps`
                };
                break;
            case 'scheduled':
                notificationData = {
                    userId: otherUserId,
                    type: 'swap_scheduled',
                    title: 'Session Scheduled!',
                    message: `${currentUser.firstName} scheduled your swap session`,
                    data: {
                        swapId: swap._id,
                        scheduledDate: swap.scheduledDate
                    },
                    relatedEntity: { type: 'Swap', id: swap._id },
                    actionUrl: `/schedule`
                };
                break;
            case 'completed':
                // Handle credit transactions
                if (oldStatus !== 'completed') {
                    const creditAmount = 50;

                    await Transaction.create([
                        {
                            user: swap.requester._id || swap.requester,
                            type: 'earn',
                            amount: creditAmount,
                            description: `Completed swap with ${swap.recipient.firstName || 'user'}`,
                            swapId: swap._id,
                            status: 'completed'
                        },
                        {
                            user: swap.recipient._id || swap.recipient,
                            type: 'earn',
                            amount: creditAmount,
                            description: `Completed swap with ${swap.requester.firstName || 'user'}`,
                            swapId: swap._id,
                            status: 'completed'
                        }
                    ]);

                    // Update requester
                    const requester = await User.findById(swap.requester._id || swap.requester);
                    requester.skillcoins = (requester.skillcoins || 0) + creditAmount;
                    requester.completedSwaps = (requester.completedSwaps || 0) + 1;

                    // Milestone: 10 Swaps
                    if (requester.completedSwaps === 10) {
                        const bonus = 100;
                        requester.skillcoins += bonus;
                        await Transaction.create({
                            user: requester._id,
                            type: 'bonus',
                            amount: bonus,
                            description: 'Milestone: 10 Completed Swaps!',
                            status: 'completed'
                        });
                    }
                    await requester.save();

                    // Update recipient
                    const recipient = await User.findById(swap.recipient._id || swap.recipient);
                    recipient.skillcoins = (recipient.skillcoins || 0) + creditAmount;
                    recipient.completedSwaps = (recipient.completedSwaps || 0) + 1;

                    // Milestone: 10 Swaps
                    if (recipient.completedSwaps === 10) {
                        const bonus = 100;
                        recipient.skillcoins += bonus;
                        await Transaction.create({
                            user: recipient._id,
                            type: 'bonus',
                            amount: bonus,
                            description: 'Milestone: 10 Completed Swaps!',
                            status: 'completed'
                        });
                    }
                    await recipient.save();

                    notificationData = {
                        userId: otherUserId,
                        type: 'swap_completed',
                        title: 'Swap Completed!',
                        message: `You earned ${creditAmount} credits from swap with ${currentUser.firstName}`,
                        data: { swapId: swap._id, creditsEarned: creditAmount },
                        relatedEntity: { type: 'Swap', id: swap._id },
                        actionUrl: `/wallet`
                    };
                }
                break;
        }

        // Send notification if data exists
        if (notificationData.userId) {
            await createNotification(notificationData);
        }

        // Notify other party via Socket (non-blocking)
        try {
            const io = getIO();
            io.to(otherUserId).emit('swap_status_update', {
                swapId: swap._id,
                status: swap.status,
                scheduledDate: swap.scheduledDate
            });
        } catch (err) {
            console.error("Socket emit failed", err);
        }
    } catch (error) {
        console.error('processSwapNotifications failed:', error);
    }
}
