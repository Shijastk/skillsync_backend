import cron from 'node-cron';
import { logger } from '../utils/logger.js';
import Swap from '../models/swap.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';
import ActivityLog from '../models/activityLog.model.js';
import EmailQueue from '../models/emailQueue.model.js';
import { createNotification } from '../controllers/notification.controller.js';
import { getIO } from '../socket/socketHandler.js';

// SWAP AUTO-EXPIRY JOB - Runs every minute
export const swapAutoExpiry = cron.schedule('* * * * *', async () => {
    try {
        const now = new Date();

        // Find swaps that are active/scheduled and past their expiry time
        const expiredSwaps = await Swap.find({
            status: { $in: ['active', 'scheduled'] },
            autoExpireAt: { $lte: now },
            skillcoinsAwarded: false
        }).populate('requester recipient');

        if (expiredSwaps.length > 0) {
            logger.info(`🔄 Processing ${expiredSwaps.length} expired swaps`);
        }

        for (const swap of expiredSwaps) {
            try {
                // Update swap status
                swap.status = 'completed';
                swap.completedAt = now;

                // Calculate skillcoin rewards (base + bonus multiplier)
                const baseReward = swap.skillcoinsEarned || 50;
                const bonusReward = Math.floor(baseReward * (swap.bonusMultiplier - 1));
                const totalReward = baseReward + bonusReward;

                // Award skillcoins to both parties
                await swap.requester.awardSkillcoins(totalReward, `Completed swap: ${swap.skillRequested}`);
                await swap.recipient.awardSkillcoins(totalReward, `Completed swap: ${swap.skillOffered}`);

                // Add XP
                await swap.requester.addXP(20);
                await swap.recipient.addXP(20);

                // Update user stats
                swap.requester.completedSwaps += 1;
                swap.requester.totalSwaps += 1;
                swap.recipient.completedSwaps += 1;
                swap.recipient.totalSwaps += 1;

                await swap.requester.save();
                await swap.recipient.save();

                // Create transactions
                await Transaction.create([
                    {
                        user: swap.requester._id,
                        type: 'earn',
                        amount: totalReward,
                        description: `Swap completed: ${swap.skillRequested} with ${swap.recipient.firstName}`,
                        source: { type: 'swap', id: swap._id },
                        balance: swap.requester.skillcoins
                    },
                    {
                        user: swap.recipient._id,
                        type: 'earn',
                        amount: totalReward,
                        description: `Swap completed: ${swap.skillOffered} with ${swap.requester.firstName}`,
                        source: { type: 'swap', id: swap._id },
                        balance: swap.recipient.skillcoins
                    }
                ]);

                // Mark swap as awarded
                swap.skillcoinsAwarded = true;
                await swap.save();

                // Create notifications
                await Promise.all([
                    createNotification({
                        userId: swap.requester._id,
                        type: 'swap_completed',
                        title: 'Swap Completed! 🎉',
                        message: `You earned ${totalReward} skillcoins from your swap with ${swap.recipient.firstName}`,
                        data: { swapId: swap._id, skillcoins: totalReward },
                        relatedEntity: { type: 'Swap', id: swap._id },
                        actionUrl: `/wallet`
                    }),
                    createNotification({
                        userId: swap.recipient._id,
                        type: 'swap_completed',
                        title: 'Swap Completed! 🎉',
                        message: `You earned ${totalReward} skillcoins from your swap with ${swap.requester.firstName}`,
                        data: { swapId: swap._id, skillcoins: totalReward },
                        relatedEntity: { type: 'Swap', id: swap._id },
                        actionUrl: `/wallet`
                    })
                ]);

                // Queue completion emails
                await EmailQueue.create([
                    {
                        user: swap.requester._id,
                        template: 'swap_completed',
                        variables: {
                            userName: swap.requester.firstName,
                            partnerName: swap.recipient.firstName,
                            skill: swap.skillRequested,
                            skillcoins: totalReward,
                            newBalance: swap.requester.skillcoins
                        }
                    },
                    {
                        user: swap.recipient._id,
                        template: 'swap_completed',
                        variables: {
                            userName: swap.recipient.firstName,
                            partnerName: swap.requester.firstName,
                            skill: swap.skillOffered,
                            skillcoins: totalReward,
                            newBalance: swap.recipient.skillcoins
                        }
                    }
                ]);

                logger.info(`✅ Auto-completed swap ${swap._id}, awarded ${totalReward} skillcoins`);
            } catch (error) {
                logger.error(`Failed to process swap ${swap._id}:`, error);
            }
        }
    } catch (error) {
        logger.error('Swap auto-expiry job failed:', error);
    }
}, {
    scheduled: false // We'll start it manually
});

// EMAIL QUEUE PROCESSOR - Runs every 30 seconds
export const emailProcessor = cron.schedule('*/30 * * * * *', async () => {
    try {
        const pendingEmails = await EmailQueue.find({
            status: 'pending',
            scheduledFor: { $lte: new Date() },
            retryCount: { $lt: 3 }
        }).limit(10).populate('user');

        for (const email of pendingEmails) {
            try {
                email.status = 'sending';
                await email.save();

                // TODO: Integrate with Brevo/SendGrid
                // For now, just log
                logger.info(`📧 Sending ${email.template} email to ${email.user.email}`);

                email.status = 'sent';
                email.sentAt = new Date();
                await email.save();
            } catch (error) {
                logger.error(`Failed to send email ${email._id}:`, error);
                email.status = 'pending';
                email.retryCount += 1;
                email.error = error.message;
                await email.save();
            }
        }
    } catch (error) {
        logger.error('Email processor job failed:', error);
    }
}, {
    scheduled: false
});

// DAILY GAMIFICATION CHECK - Runs at midnight
export const dailyGamification = cron.schedule('0 0 * * *', async () => {
    try {
        logger.info('🎮 Running daily gamification check');

        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Check all users
        const users = await User.find({ isActive: true });

        for (const user of users) {
            try {
                // Check login streak
                if (user.lastLoginAt) {
                    const daysSinceLastLogin = Math.floor((now - user.lastLoginAt) / (24 * 60 * 60 * 1000));

                    if (daysSinceLastLogin === 1) {
                        // Streak continues
                        user.loginStreak += 1;

                        // Award streak bonuses
                        if (user.loginStreak === 7) {
                            await user.awardSkillcoins(50, '7-day login streak bonus');
                            await EmailQueue.create({
                                user: user._id,
                                template: 'skillcoin_earned',
                                variables: {
                                    userName: user.firstName,
                                    amount: 50,
                                    reason: '7-day login streak',
                                    newBalance: user.skillcoins
                                }
                            });
                        } else if (user.loginStreak === 30) {
                            await user.awardSkillcoins(200, '30-day login streak bonus');
                        }

                        await user.save();
                    } else if (daysSinceLastLogin > 1) {
                        // Streak broken
                        user.loginStreak = 0;
                        await user.save();
                    }
                }

                // Check for milestone achievements
                // (e.g., total swaps milestones)
                if (user.completedSwaps === 10 || user.completedSwaps === 50 || user.completedSwaps === 100) {
                    const bonus = user.completedSwaps === 10 ? 100 : user.completedSwaps === 50 ? 500 : 1000;
                    await user.awardSkillcoins(bonus, `${user.completedSwaps} swaps milestone`);
                }
            } catch (error) {
                logger.error(`Failed to process gamification for user ${user._id}:`, error);
            }
        }

        logger.info('✅ Daily gamification check completed');
    } catch (error) {
        logger.error('Daily gamification job failed:', error);
    }
}, {
    scheduled: false
});

// Start all jobs
export const startBackgroundJobs = () => {
    logger.info('🚀 Starting background jobs...');
    swapAutoExpiry.start();
    emailProcessor.start();
    dailyGamification.start();
    logger.info('✅ All background jobs started');
};

// Stop all jobs (for graceful shutdown)
export const stopBackgroundJobs = () => {
    logger.info('⏸️  Stopping background jobs...');
    swapAutoExpiry.stop();
    emailProcessor.stop();
    dailyGamification.stop();
    logger.info('✅ All background jobs stopped');
};
