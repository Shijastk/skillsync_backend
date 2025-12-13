import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

dotenv.config();
import User from './models/user.model.js';
import Swap from './models/swap.model.js';
import Post from './models/post.model.js';
import Group from './models/group.model.js';
import Message from './models/message.model.js';
import Conversation from './models/conversation.model.js';
import Transaction from './models/transaction.model.js';
import Notification from './models/notification.model.js';
import ActivityLog from './models/activityLog.model.js';
import EmailQueue from './models/emailQueue.model.js';

const createIndexes = async () => {
    try {
        await connectDB();
        logger.info('🔍 Creating database indexes for optimal performance...');

        // USER INDEXES
        logger.info('Creating User indexes...');
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ referralCode: 1 }, { unique: true, sparse: true });
        await User.collection.createIndex({ firstName: 1, lastName: 1 });
        await User.collection.createIndex({ location: 1 });
        await User.collection.createIndex({ skillcoins: -1 }); // For leaderboards
        await User.collection.createIndex({ level: -1 }); // For level leaderboards
        await User.collection.createIndex({ createdAt: -1 });
        await User.collection.createIndex({ 'skillsToTeach.name': 1 }); // For skill search
        await User.collection.createIndex({ 'skillsToLearn.name': 1 }); // For skill search
        await User.collection.createIndex({ isActive: 1 });

        // Text index for search
        await User.collection.createIndex({
            firstName: 'text',
            lastName: 'text',
            bio: 'text',
            location: 'text'
        }, {
            weights: {
                firstName: 10,
                lastName: 10,
                bio: 5,
                location: 3
            },
            name: 'user_text_search'
        });

        // SWAP INDEXES
        logger.info('Creating Swap indexes...');
        await Swap.collection.createIndex({ requester: 1 });
        await Swap.collection.createIndex({ recipient: 1 });
        await Swap.collection.createIndex({ status: 1 });
        await Swap.collection.createIndex({ autoExpireAt: 1 }); // For background job
        await Swap.collection.createIndex({ scheduledDate: 1 });
        await Swap.collection.createIndex({ createdAt: -1 });
        await Swap.collection.createIndex({ skillOffered: 1 });
        await Swap.collection.createIndex({ skillRequested: 1 });

        // Compound indexes for common queries
        await Swap.collection.createIndex({ requester: 1, status: 1, createdAt: -1 });
        await Swap.collection.createIndex({ recipient: 1, status: 1, createdAt: -1 });
        await Swap.collection.createIndex({ status: 1, autoExpireAt: 1 }); // For auto-expiry job

        // Text index
        await Swap.collection.createIndex({
            skillOffered: 'text',
            skillRequested: 'text',
            description: 'text'
        }, { name: 'swap_text_search' });

        // POST INDEXES
        logger.info('Creating Post indexes...');
        await Post.collection.createIndex({ author: 1, createdAt: -1 });
        await Post.collection.createIndex({ group: 1, createdAt: -1 });
        await Post.collection.createIndex({ createdAt: -1 });
        await Post.collection.createIndex({ 'likes': 1 }); // For trending

        // Text index
        await Post.collection.createIndex({ content: 'text' }, { name: 'post_text_search' });

        // GROUP INDEXES
        logger.info('Creating Group indexes...');
        await Group.collection.createIndex({ creator: 1 });
        await Group.collection.createIndex({ category: 1 });
        await Group.collection.createIndex({ members: 1 });
        await Group.collection.createIndex({ createdAt: -1 });

        // Text index
        await Group.collection.createIndex({
            name: 'text',
            description: 'text',
            category: 'text'
        }, {
            weights: {
                name: 10,
                category: 5,
                description: 3
            },
            name: 'group_text_search'
        });

        // MESSAGE INDEXES
        logger.info('Creating Message indexes...');
        await Message.collection.createIndex({ conversationId: 1, createdAt: 1 });
        await Message.collection.createIndex({ sender: 1 });
        await Message.collection.createIndex({ createdAt: -1 });

        // CONVERSATION INDEXES
        logger.info('Creating Conversation indexes...');
        await Conversation.collection.createIndex({ participants: 1 });
        await Conversation.collection.createIndex({ lastMessageTime: -1 });
        await Conversation.collection.createIndex({ contextId: 1 });

        // TRANSACTION INDEXES
        logger.info('Creating Transaction indexes...');
        await Transaction.collection.createIndex({ user: 1, createdAt: -1 });
        await Transaction.collection.createIndex({ type: 1 });
        await Transaction.collection.createIndex({ createdAt: -1 });
        await Transaction.collection.createIndex({ 'source.type': 1, 'source.id': 1 });

        // NOTIFICATION INDEXES (Already exist but ensure)
        logger.info('Creating Notification indexes...');
        await Notification.collection.createIndex({ userId: 1, createdAt: -1 });
        await Notification.collection.createIndex({ isRead: 1, userId: 1 });
        await Notification.collection.createIndex({ createdAt: -1 });

        // ACTIVITY LOG INDEXES (Already exist but ensure)
        logger.info('Creating ActivityLog indexes...');
        await ActivityLog.collection.createIndex({ user: 1, type: 1, createdAt: -1 });
        await ActivityLog.collection.createIndex({ processed: 1, createdAt: 1 });

        // EMAIL QUEUE INDEXES (Already exist but ensure)
        logger.info('Creating EmailQueue indexes...');
        await EmailQueue.collection.createIndex({ status: 1, scheduledFor: 1 });
        await EmailQueue.collection.createIndex({ user: 1, template: 1 });

        logger.info('====================================');
        logger.info('✅ All database indexes created successfully!');
        logger.info('====================================');
        logger.info('Performance optimization complete. Your queries will be blazing fast! ⚡');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error creating indexes:', error);
        process.exit(1);
    }
};

createIndexes();
