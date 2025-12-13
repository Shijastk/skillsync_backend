import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { responseTransformer } from './middleware/responseTransformer.middleware.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import swapRoutes from './routes/swap.routes.js';
import groupRoutes from './routes/group.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import messageRoutes from './routes/message.routes.js';
import postRoutes from './routes/post.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import walletRoutes from './routes/wallet.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import statsRoutes from './routes/stats.routes.js';
import gamificationRoutes from './routes/gamification.routes.js';
import referralRoutes from './routes/referral.routes.js';
import searchRoutes from './routes/search.routes.js';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'], credentials: true }));

// Compression Middleware (gzip)
app.use(compression());

// Cookie Parser Middleware
app.use(cookieParser());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Response Transformer (MongoDB _id → id, etc.)
app.use('/api/', responseTransformer);

// Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting (Apply to API routes)
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/swaps', swapRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/search', searchRoutes);

// Root route for sanity check
app.get('/', (req, res) => {
    res.json({
        message: 'SkillSwap API is running...',
        version: '2.0.0',
        features: [
            'Real-time messaging (Socket.io)',
            'Smart recommendations',
            'Notifications system',
            'In-memory caching',
            'File uploads (Cloudinary)',
            'Rate limiting & security'
        ],
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            swaps: '/api/swaps',
            groups: '/api/groups',
            conversations: '/api/conversations',
            messages: '/api/messages',
            posts: '/api/posts',
            transactions: '/api/transactions',
            wallet: '/api/wallet',
            notifications: '/api/notifications',
            recommendations: '/api/recommendations'
        }
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error Handling Middleware (Must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
