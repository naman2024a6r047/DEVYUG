"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const next_1 = __importDefault(require("next"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
// Load environment configurations
dotenv_1.default.config();
// Import route modules
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const subscriptionRoutes_1 = __importDefault(require("./routes/subscriptionRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const blogRoutes_1 = __importDefault(require("./routes/blogRoutes"));
const dev = process.env.NODE_ENV !== 'production';
const frontendDir = path_1.default.join(__dirname, '../../frontend');
logger_1.logger.info(`Initializing Next.js App in ${dev ? 'development' : 'production'} mode...`);
logger_1.logger.info(`Frontend assets directory: ${frontendDir}`);
const nextApp = (0, next_1.default)({ dev, dir: frontendDir });
const handle = nextApp.getRequestHandler();
nextApp.prepare().then(() => {
    const app = (0, express_1.default)();
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
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Allow requests with no origin (Postman, server-to-server, same-origin)
            if (!origin)
                return callback(null, true);
            // Allow if the origin matches our list or if no list is configured (dev fallback)
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            callback(new Error(`CORS policy violation: ${origin} is not allowed`));
        },
        credentials: true
    }));
    // Setup JSON body parsing middleware
    app.use(express_1.default.json());
    // API health check
    app.get('/api/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            message: 'DVYUG Vedic Wellness API is online',
            timestamp: new Date().toISOString()
        });
    });
    // Bind API route paths
    app.use('/api/auth', authRoutes_1.default);
    app.use('/api/products', productRoutes_1.default);
    app.use('/api/orders', orderRoutes_1.default);
    app.use('/api/subscriptions', subscriptionRoutes_1.default);
    app.use('/api/ai', aiRoutes_1.default);
    app.use('/api/admin', adminRoutes_1.default);
    app.use('/api/blogs', blogRoutes_1.default);
    // Register global API error handler middleware
    app.use('/api', errorHandler_1.errorHandler);
    // Serve Next.js pages for all non-API requests
    app.all('*', (req, res) => {
        return handle(req, res);
    });
    // Launch server listener
    app.listen(PORT, () => {
        logger_1.logger.info(`Unified server is actively running on port ${PORT}`);
        logger_1.logger.info(`Vedic Wellness API base path: http://localhost:${PORT}/api`);
        logger_1.logger.info(`Next.js Front Path: http://localhost:${PORT}`);
    });
}).catch((err) => {
    logger_1.logger.error('Failed to prepare Next.js application:', err);
    process.exit(1);
});
