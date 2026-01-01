import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const fixTokenIndex = async () => {
    try {
        console.log('🔧 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const db = mongoose.connection.db;
        const collection = db.collection('refreshtokens');

        // List all indexes
        console.log('📋 Current indexes on refreshtokens collection:');
        const indexes = await collection.indexes();
        indexes.forEach(index => {
            console.log(`   - ${index.name}:`, JSON.stringify(index.key));
        });

        console.log('\n🔍 Looking for problematic token_1 index...');

        // Check if token_1 index exists
        const tokenIndex = indexes.find(idx => idx.name === 'token_1');

        if (tokenIndex) {
            console.log('⚠️  Found token_1 index. Dropping it to resolve conflict...');
            console.log('🗑️  Dropping token_1 index...');

            await collection.dropIndex('token_1');
            console.log('✅ Successfully dropped token_1 index!\n');

            // Verify it's gone
            const updatedIndexes = await collection.indexes();
            console.log('📋 Updated indexes:');
            updatedIndexes.forEach(index => {
                console.log(`   - ${index.name}:`, JSON.stringify(index.key));
            });

            console.log('\n🎉 Fix complete! You can now restart your application.');
        } else {
            console.log('✅ token_1 index not found - nothing to fix!');
            console.log('   If you\'re still getting errors, check if the collection name is correct.');
        }

        await mongoose.connection.close();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error occurred:');
        console.error('   Message:', error.message);

        if (error.codeName === 'NamespaceNotFound') {
            console.log('\n⚠️ Collection refreshtokens does not exist yet. No indexes to fix.');
            process.exit(0);
        }

        if (error.codeName === 'IndexNotFound') {
            console.log('\n✅ Index already dropped or doesn\'t exist - you\'re good to go!');
            process.exit(0);
        } else {
            console.error('\n   Full error:', error);
            process.exit(1);
        }
    }
};

console.log('🚀 Starting MongoDB Token Index Fix Script...\n');
fixTokenIndex();
