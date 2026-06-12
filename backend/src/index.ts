import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import next from 'next';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Load environment configurations
dotenv.config();

// Import route modules
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import blogRoutes from './routes/blogRoutes';

const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path.join(__dirname, '../../frontend');

logger.info(`Initializing Next.js App in ${dev ? 'development' : 'production'} mode...`);
logger.info(`Frontend assets directory: ${frontendDir}`);

const nextApp = next({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Trust reverse proxy (needed for Hostinger/Nginx proxy environments)
  app.set('trust proxy', 1);

  // Setup CORS middleware
  // In production the Next.js frontend is served by the SAME Express process (same port),
  // so same-origin API calls don't need CORS. We still configure it broadly for any
  // external tool access, or in case a separate frontend domain is needed.
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL || ''].filter(Boolean)
    : ['http://localhost:3000', 'http://localhost:5000'];

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server, same-origin)
      if (!origin) return callback(null, true);
      // Allow if the origin matches our list or if no list is configured (dev fallback)
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS policy violation: ${origin} is not allowed`));
    },
    credentials: true
  }));

  // Setup JSON body parsing middleware
  app.use(express.json());

  // API health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      message: 'DVYUG Vedic Wellness API is online',
      timestamp: new Date().toISOString()
    });
  });

  // Bind API route paths
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/subscriptions', subscriptionRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/blogs', blogRoutes);

  // Register global API error handler middleware
  app.use('/api', errorHandler);

  // Serve Next.js pages for all non-API requests
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  // Launch server listener
  app.listen(PORT, () => {
    logger.info(`Unified server is actively running on port ${PORT}`);
    logger.info(`Vedic Wellness API base path: http://localhost:${PORT}/api`);
    logger.info(`Next.js Front Path: http://localhost:${PORT}`);
  });
}).catch((err) => {
  logger.error('Failed to prepare Next.js application:', err);
  process.exit(1);
});

