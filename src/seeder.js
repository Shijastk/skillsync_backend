import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
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

dotenv.config();

const seed = async () => {
    try {
        await connectDB();
        logger.info('🌱 SEEDING DATABASE...');

        // Clear all collections
        await User.deleteMany({});
        await Swap.deleteMany({});
        await Group.deleteMany({});
        await Post.deleteMany({});
        await Conversation.deleteMany({});
        await Message.deleteMany({});
        await Transaction.deleteMany({});
        await Notification.deleteMany({});
        await Achievement.deleteMany({});
        await ActivityLog.deleteMany({});
        await EmailQueue.deleteMany({});

        //1. Create Achievements
        logger.info('Creating achievements...');
        const achievements = await Achievement.insertMany([
            { type: 'badge', name: 'First Timer', description: 'Complete your first swap', icon: '🎯', tier: 'bronze', reward: { skillcoins: 30, xp: 20 } },
            { type: 'milestone', name: 'Expert', description: 'Complete 50 swaps', icon: '👑', tier: 'gold', reward: { skillcoins: 500, xp: 200 } },
            { type: 'streak', name: 'Weekly', description: '7-day streak', icon: '🔥', tier: 'bronze', reward: { skillcoins: 50, xp: 30 } },
            { type: 'referral', name: 'Connector', description: 'Refer 5 friends', icon: '🎁', tier: 'silver', reward: { skillcoins: 250, xp: 100 } }
        ]);

        // 2. Create Users
        logger.info('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);
        const users = await User.insertMany([
            { firstName: 'John', lastName: 'Smith', email: 'john@test.com', password: hashedPassword, skillcoins: 150, level: 3, xp: 250, avatar: 'https://i.pravatar.cc/150?img=1', bio: 'Web developer', skillsToTeach: [{ name: 'JavaScript', level: 'Advanced' }], skillsToLearn: [{ name: 'Python', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Sarah', lastName: 'Jones', email: 'sarah@test.com', password: hashedPassword, skillcoins: 200, level: 4, xp: 400, avatar: 'https://i.pravatar.cc/150?img=2', bio: 'Designer', skillsToTeach: [{ name: 'UI/UX', level: 'Advanced' }], skillsToLearn: [{ name: 'React', level: 'Intermediate' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Mike', lastName: 'Davis', email: 'mike@test.com', password: hashedPassword, skillcoins: 100, level: 2, xp: 150, avatar: 'https://i.pravatar.cc/150?img=3', bio: 'Marketer', skillsToTeach: [{ name: 'SEO', level: 'Intermediate' }], skillsToLearn: [{ name: 'Design', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Emma', lastName: 'Wilson', email: 'emma@test.com', password: hashedPassword, skillcoins: 180, level: 3, xp: 300, avatar: 'https://i.pravatar.cc/150?img=4', bio: 'Writer', skillsToTeach: [{ name: 'Writing', level: 'Advanced' }], skillsToLearn: [{ name: 'Photography', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'David', lastName: 'Brown', email: 'david@test.com', password: hashedPassword, skillcoins: 250, level: 5, xp: 600, avatar: 'https://i.pravatar.cc/150?img=5', bio: 'Developer', skillsToTeach: [{ name: 'Python', level: 'Expert' }], skillsToLearn: [{ name: 'Machine Learning', level: 'Intermediate' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Lisa', lastName: 'Taylor', email: 'lisa@test.com', password: hashedPassword, skillcoins: 120, level: 2, xp: 180, avatar: 'https://i.pravatar.cc/150?img=6', bio: 'Photographer', skillsToTeach: [{ name: 'Photography', level: 'Advanced' }], skillsToLearn: [{ name: 'Video Editing', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Tom', lastName: 'Anderson', email: 'tom@test.com', password: hashedPassword, skillcoins: 90, level: 1, xp: 50, avatar: 'https://i.pravatar.cc/150?img=7', bio: 'Student', skillsToTeach: [{ name: 'Spanish', level: 'Intermediate' }], skillsToLearn: [{ name: 'Guitar', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Amy', lastName: 'Martinez', email: 'amy@test.com', password: hashedPassword, skillcoins: 300, level: 6, xp: 800, avatar: 'https://i.pravatar.cc/150?img=8', bio: 'Data Scientist', skillsToTeach: [{ name: 'Data Analysis', level: 'Expert' }], skillsToLearn: [{ name: 'Business', level: 'Intermediate' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Chris', lastName: 'Garcia', email: 'chris@test.com', password: hashedPassword, skillcoins: 140, level: 3, xp: 280, avatar: 'https://i.pravatar.cc/150?img=9', bio: 'Teacher', skillsToTeach: [{ name: 'Public Speaking', level: 'Advanced' }], skillsToLearn: [{ name: 'Content Creation', level: 'Beginner' }], referralCode: uuidv4().slice(0, 8).toUpperCase() },
            { firstName: 'Rachel', lastName: 'Lee', email: 'rachel@test.com', password: hashedPassword, skillcoins: 210, level: 4, xp: 450, avatar: 'https://i.pravatar.cc/150?img=10', bio: 'Entrepreneur', skillsToTeach: [{ name: 'Business', level: 'Advanced' }], skillsToLearn: [{ name: 'Marketing', level: 'Intermediate' }], referralCode: uuidv4().slice(0, 8).toUpperCase() }
        ]);

        // 3. Create Swaps
        logger.info('Creating swaps...');
        await Swap.insertMany([
            { requester: users[0]._id, recipient: users[1]._id, skillOffered: 'JavaScript', skillRequested: 'UI/UX', status: 'completed', skillcoinsEarned: 50, completedAt: new Date() },
            { requester: users[2]._id, recipient: users[3]._id, skillOffered: 'SEO', skillRequested: 'Writing', status: 'scheduled', scheduledDate: new Date(Date.now() + 86400000) },
            { requester: users[4]._id, recipient: users[5]._id, skillOffered: 'Python', skillRequested: 'Photography', status: 'active' },
            { requester: users[6]._id, recipient: users[7]._id, skillOffered: 'Spanish', skillRequested: 'Data Analysis', status: 'pending' },
            { requester: users[8]._id, recipient: users[9]._id, skillOffered: 'Public Speaking', skillRequested: 'Business', status: 'accepted' }
        ]);

        // 4. Create Groups
        logger.info('Creating groups...');
        await Group.insertMany([
            { name: 'Web Developers', description: 'Community for web devs', category: 'Technology', creator: users[0]._id, members: [users[0]._id, users[1]._id, users[4]._id] },
            { name: 'Designers United', description: 'Design community', category: 'Design', creator: users[1]._id, members: [users[1]._id, users[3]._id, users[5]._id] },
            { name: 'Marketing Hub', description: 'Marketing pros', category: 'Marketing', creator: users[2]._id, members: [users[2]._id, users[9]._id] }
        ]);

        // 5. Create Posts
        logger.info('Creating posts...');
        await Post.insertMany([
            { author: users[0]._id, content: 'Just completed my first swap! Amazing experience.', likes: [users[1]._id, users[2]._id], comments: [] },
            { author: users[1]._id, content: 'Looking for JavaScript tutors. Can teach design!', likes: [users[0]._id], comments: [] },
            { author: users[4]._id, content: 'Python tips: Always use list comprehensions!', likes: [users[0]._id, users[7]._id, users[9]._id], comments: [] }
        ]);

        // 6. Create Transactions
        logger.info('Creating transactions...');
        await Transaction.insertMany([
            { user: users[0]._id, type: 'earn', amount: 50, description: 'Swap completed', balance: users[0].skillcoins },
            { user: users[1]._id, type: 'earn', amount: 50, description: 'Swap completed', balance: users[1].skillcoins },
            { user: users[2]._id, type: 'bonus', amount: 20, description: 'Profile complete', balance: users[2].skillcoins }
        ]);

        // 7. Create Notifications
        logger.info('Creating notifications...');
        await Notification.insertMany([
            { userId: users[0]._id, type: 'swap_completed', title: 'Swap Completed!', message: 'You earned 50 skillcoins', isRead: false },
            { userId: users[2]._id, type: 'swap_request', title: 'New Swap Request', message: 'Someone wants to swap with you', isRead: false }
        ]);

        // 8. Create Activity Logs  
        logger.info('Creating activity logs...');
        await ActivityLog.insertMany([
            { user: users[0]._id, type: 'login', skillcoinsEarned: 0, xpEarned: 2, processed: true },
            { user: users[1]._id, type: 'swap_completed', skillcoinsEarned: 50, xpEarned: 20, processed: true }
        ]);

        // 9. Create Email Queue
        logger.info('Creating email queue...');
        await EmailQueue.insertMany([
            { user: users[0]._id, template: 'swap_completed', variables: { userName: 'John', amount: 50 }, status: 'sent', sentAt: new Date() },
            { user: users[1]._id, template: 'welcome', variables: { userName: 'Sarah' }, status: 'pending' }
        ]);

        logger.info('='.repeat(50));
        logger.info('✅ DATABASE SEEDED SUCCESSFULLY!');
        logger.info(`  Users: ${users.length}`);
        logger.info(`  Achievements: ${achievements.length}`);
        logger.info('  Test Login: john@test.com / password123');
        logger.info('='.repeat(50));

        process.exit(0);
    } catch (error) {
        logger.error('Error seeding:', error);
        process.exit(1);
    }
};

seed();
