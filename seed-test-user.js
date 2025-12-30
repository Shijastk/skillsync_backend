import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import User from './src/models/user.model.js';

dotenv.config();

const createSimpleTestUser = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        const existingUser = await User.findOne({ email: 'john@test.com' });

        if (existingUser) {
            console.log('\n⚠️  User already exists!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📧 Email: john@test.com');
            console.log('🔑 Password: password123');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Create new user (password will be hashed automatically by the pre-save hook)
        const user = await User.create({
            firstName: 'John',
            lastName: 'Smith',
            email: 'john@test.com',
            password: 'password123',
            bio: 'Test user for development',
            avatar: 'https://i.pravatar.cc/150?img=1',
            skillcoins: 150,
            level: 3,
            xp: 250
        });

        console.log('\n✅ Test user created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email: john@test.com');
        console.log('🔑 Password: password123');
        console.log('👤 Name:', user.firstName, user.lastName);
        console.log('💰 Skillcoins:', user.skillcoins);
        console.log('🎯 Level:', user.level);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n✨ You can now login with these credentials!\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createSimpleTestUser();
