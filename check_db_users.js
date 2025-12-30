
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await User.countDocuments();
        console.log(`Total users in DB: ${count}`);

        const users = await User.find({}, 'firstName lastName email _id');
        console.log('Users list:');
        users.forEach(u => {
            console.log(`- ${u.firstName} ${u.lastName} (${u.email}) [${u._id}]`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
