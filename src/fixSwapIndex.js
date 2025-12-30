import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const fixSwapIndex = async () => {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collection = db.collection('swaps');

        // List all indexes
        console.log('📋 Current indexes on swaps collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`   - ${index.name}:`, JSON.stringify(index.key));
        });

        console.log('\n🔍 Looking for problematic swapId_1 index...');

        // Check if swapId_1 index exists
        const swapIdIndex = indexes.find(idx => idx.name === 'swapId_1');

        if (swapIdIndex) {
            console.log('⚠️  Found swapId_1 index - this is causing the duplicate key error');
            console.log('🗑️  Dropping swapId_1 index...');

            await collection.dropIndex('swapId_1');
            console.log('✅ Successfully dropped swapId_1 index!\n');

            // Verify it's gone
            const updatedIndexes = await collection.indexes();
            console.log('📋 Updated indexes:');
            updatedIndexes.forEach(index => {
                console.log(`   - ${index.name}:`, JSON.stringify(index.key));
            });

            console.log('\n🎉 Fix complete! You can now create swaps without errors.');
        } else {
            console.log('✅ swapId_1 index not found - nothing to fix!');
            console.log('   If you\'re still getting errors, the issue might be different.');
        }

        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error occurred:');
        console.error('   Message:', error.message);

        if (error.codeName === 'IndexNotFound') {
            console.log('\n✅ Index already dropped or doesn\'t exist - you\'re good to go!');
            process.exit(0);
        } else {
            console.error('\n   Full error:', error);
            process.exit(1);
        }
    }
};

console.log('🚀 Starting MongoDB Index Fix Script...\n');
fixSwapIndex();
