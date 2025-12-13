import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

// Import all models
import User from './models/user.model.js';
import Swap from './models/swap.model.js';
import Group from './models/group.model.js';
import Post from './models/post.model.js';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';
import Transaction from './models/transaction.model.js';
import Notification from './models/notification.model.js';
import Achievement from './models/achievement.model.js';
import ActivityLog from './models/activityLog.model.js';
import EmailQueue from './models/emailQueue.model.js';
import RefreshToken from './models/refreshToken.model.js';

dotenv.config();

const clearDatabase = async () => {
    try {
        await connectDB();

        logger.info('🗑️  DATABASE CLEANUP STARTING...');
        logger.info('====================================');

        // Delete all data from all collections
        const collections = [
            { name: 'Users', model: User },
            { name: 'Swaps', model: Swap },
            { name: 'Groups', model: Group },
            { name: 'Posts', model: Post },
            { name: 'Conversations', model: Conversation },
            { name: 'Messages', model: Message },
            { name: 'Transactions', model: Transaction },
            { name: 'Notifications', model: Notification },
            { name: 'Achievements', model: Achievement },
            { name: 'ActivityLogs', model: ActivityLog },
            { name: 'EmailQueue', model: EmailQueue },
            { name: 'RefreshTokens', model: RefreshToken }
        ];

        for (const collection of collections) {
            const count = await collection.model.countDocuments();
            if (count > 0) {
                await collection.model.deleteMany({});
                logger.info(`✅ Deleted ${count} documents from ${collection.name}`);
            } else {
                logger.info(`ℹ️  ${collection.name} was already empty`);
            }
        }

        logger.info('====================================');
        logger.info('✅ DATABASE COMPLETELY CLEARED!');
        logger.info('====================================');
        logger.info('');
        logger.info('📝 Notes:');
        logger.info('   - All MongoDB collections are now empty');
        logger.info('   - Cloudinary images are NOT deleted (manual cleanup required)');
        logger.info('   - Database indexes are preserved');
        logger.info('');
        logger.info('💡 Next steps:');
        logger.info('   1. Seed achievements: npm run seed:achievements');
        logger.info('   2. Create test data: npm run seed');
        logger.info('   3. Create indexes: npm run create:indexes');

        process.exit(0);
    } catch (error) {
        logger.error('❌ Error clearing database:', error);
        process.exit(1);
    }
};

// Safety check - require confirmation
const args = process.argv.slice(2);
if (args.includes('--confirm')) {
    clearDatabase();
} else {
    console.log('⚠️  WARNING: This will DELETE ALL data from the database!');
    console.log('');
    console.log('This includes:');
    console.log('  - All users');
    console.log('  - All swaps');
    console.log('  - All messages');
    console.log('  - All posts');
    console.log('  - All groups');
    console.log('  - All transactions');
    console.log('  - All notifications');
    console.log('  - All refresh tokens');
    console.log('  - Everything else');
    console.log('');
    console.log('⚠️  This action CANNOT be undone!');
    console.log('');
    console.log('To proceed, run:');
    console.log('  node src/clearDatabase.js --confirm');
    console.log('');
    process.exit(0);
}
