
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const dummyUsers = [
    {
        firstName: "Alice",
        lastName: "Wonderland",
        email: "alice@example.com",
        password: "password123",
        bio: "Frontend Developer loving React",
        role: "Developer",
        location: "New York, USA",
        skillsToTeach: [
            { title: "React", description: "Modern React patterns", category: "Development", experienceLevel: "expert" },
            { title: "JavaScript", description: "ES6+", category: "Development", experienceLevel: "expert" }
        ],
        skillsToLearn: [
            { title: "Python", description: "Data Science basics", category: "Development", experienceLevel: "beginner" }
        ]
    },
    {
        firstName: "Bob",
        lastName: "Builder",
        email: "bob@example.com",
        password: "password123",
        bio: "Backend Engineer and DevOps enthusiast",
        role: "Engineer",
        location: "San Francisco, USA",
        skillsToTeach: [
            { title: "Node.js", description: "Scalable backend systems", category: "Development", experienceLevel: "expert" },
            { title: "Docker", description: "Containerization", category: "DevOps", experienceLevel: "intermediate" }
        ],
        skillsToLearn: [
            { title: "React", description: "Frontend basics", category: "Development", experienceLevel: "beginner" }
        ]
    },
    {
        firstName: "Charlie",
        lastName: "Designer",
        email: "charlie@example.com",
        password: "password123",
        bio: "UI/UX Designer with a passion for minimal interfaces",
        role: "Designer",
        location: "London, UK",
        skillsToTeach: [
            { title: "Figma", description: "Prototyping and design systems", category: "Design", experienceLevel: "expert" },
            { title: "CSS", description: "Advanced animations", category: "Development", experienceLevel: "advanced" }
        ],
        skillsToLearn: [
            { title: "JavaScript", description: "Interactive UIs", category: "Development", experienceLevel: "intermediate" }
        ]
    },
    {
        firstName: "Diana",
        lastName: "Prince",
        email: "diana@example.com",
        password: "password123",
        bio: "Data Scientist looking to learn web dev",
        role: "Data Scientist",
        location: "Berlin, Germany",
        skillsToTeach: [
            { title: "Python", description: "Data analysis and ML", category: "Data Science", experienceLevel: "expert" },
            { title: "SQL", description: "Database management", category: "Data Science", experienceLevel: "advanced" }
        ],
        skillsToLearn: [
            { title: "Web Design", description: "Making things look good", category: "Design", experienceLevel: "beginner" }
        ]
    }
];

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const user of dummyUsers) {
            const existingUser = await User.findOne({ email: user.email });
            if (!existingUser) {
                // Password hashing is handled by pre-save hook in User model
                // const salt = await bcrypt.genSalt(10);
                // user.password = await bcrypt.hash(user.password, salt);

                await User.create(user);
                console.log(`Created user: ${user.firstName} ${user.lastName}`);
            } else {
                console.log(`User already exists: ${user.firstName} ${user.lastName}`);
            }
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

seedUsers();
