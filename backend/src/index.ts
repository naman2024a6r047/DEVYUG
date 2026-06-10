import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment configurations
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (needed for Hostinger/Nginx proxy environments)
app.set('trust proxy', 1);

// Setup CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Setup JSON body parsing middleware
app.use(express.json());

// Root health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'DVYUG Vedic Wellness API is online',
    timestamp: new Date().toISOString()
  });
});

// Import route modules
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import blogRoutes from './routes/blogRoutes';

// Bind API route paths
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);

// Register global error handler middleware
app.use(errorHandler);

// Launch server listener
app.listen(PORT, () => {
  logger.info(`Server is actively running on port ${PORT}`);
  logger.info(`Vedic Wellness API base path: http://localhost:${PORT}/api`);
});
