import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/socketHandler.js';
import { logger } from './utils/logger.js';
import { startBackgroundJobs, stopBackgroundJobs } from './services/backgroundJobs.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Connect to MongoDB and Start Server
const startServer = async () => {
    try {
        await connectDB();

        // Start Background Jobs
        startBackgroundJobs();

        server.listen(PORT, () => {
            logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
            logger.info(`🚀 SkillSwap Backend v3.0 - Production Ready`);
            logger.info(`📡 API: http://localhost:${PORT}`);
            logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
            logger.info(`⚙️  Background jobs active`);
        });
    } catch (error) {
        logger.error(`Failed to connect to database: ${error.message}`);
        process.exit(1);
    }
};

startServer();

// Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully...');
    stopBackgroundJobs();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully...');
    stopBackgroundJobs();
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});
