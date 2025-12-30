import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Conversation from './models/conversation.model.js';
import Message from './models/message.model.js';
import Swap from './models/swap.model.js';
import { connectDB } from './config/db.js';

dotenv.config();

/**
 * Backfill Script: Create initial messages for empty conversations
 * 
 * This script finds conversations that have no messages and creates
 * an initial message for each one based on the swap details.
 */

const backfillMessages = async () => {
    try {
        console.log('🔍 Connecting to database...');
        await connectDB();

        console.log('📊 Finding conversations without messages...');

        // Get all conversations
        const conversations = await Conversation.find({ type: 'swap_request' });
        console.log(`Found ${conversations.length} swap conversations`);

        let emptyCount = 0;
        let fixedCount = 0;
        let errorCount = 0;

        for (const conversation of conversations) {
            try {
                // Check if conversation has any messages
                const messageCount = await Message.countDocuments({
                    conversationId: conversation._id
                });

                if (messageCount === 0) {
                    emptyCount++;
                    console.log(`\n📭 Empty conversation found: ${conversation._id}`);

                    // Get the swap details
                    const swap = await Swap.findById(conversation.contextId)
                        .populate('requester', 'firstName lastName')
                        .populate('recipient', 'firstName lastName');

                    if (!swap) {
                        console.log(`   ⚠️  Swap not found for conversation ${conversation._id}`);
                        errorCount++;
                        continue;
                    }

                    // Create initial message
                    const message = await Message.create({
                        conversationId: conversation._id,
                        sender: swap.requester._id,
                        content: swap.description ||
                            `Hi! I'd like to swap ${swap.skillOffered} for ${swap.skillRequested}. Let's discuss the details!`,
                        type: 'text',
                        readBy: [swap.requester._id],
                        createdAt: conversation.createdAt // Use conversation creation date
                    });

                    console.log(`   ✅ Created initial message: "${message.content.substring(0, 50)}..."`);
                    fixedCount++;
                }
            } catch (error) {
                console.error(`   ❌ Error processing conversation ${conversation._id}:`, error.message);
                errorCount++;
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 BACKFILL SUMMARY:');
        console.log('='.repeat(60));
        console.log(`Total conversations checked: ${conversations.length}`);
        console.log(`Empty conversations found:   ${emptyCount}`);
        console.log(`✅ Successfully fixed:       ${fixedCount}`);
        console.log(`❌ Errors:                   ${errorCount}`);
        console.log(`✨ Conversations with messages: ${conversations.length - emptyCount}`);
        console.log('='.repeat(60));

        console.log('\n✅ Backfill complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Backfill failed:', error);
        process.exit(1);
    }
};

// Run the script
backfillMessages();
