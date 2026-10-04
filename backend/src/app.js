import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';

import ApiResponse from './utils/ApiResponse.js';
import errorHandler from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

// Trust reverse proxy (e.g. Render, Railway, Fly.io, Cloudflare, Vercel)
// Essential for secure cookies, proper rate limiting, and HTTPS detection
if (process.env.NODE_ENV === 'production' || process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// -----------------------------------------------------------------------------
// CORS Configuration
// Supports multi-domain production setups, local development, and preview URLs
// -----------------------------------------------------------------------------
const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:4173',
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',')
      .map((url) => url.trim().replace(/\/+$/, ''))
      .filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultLocalOrigins, ...envOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server, Postman)
    if (!origin) {
      return callback(null, true);
    }

    const isExplicitlyAllowed = allowedOrigins.includes(origin);
    const isVercelPreview =
      process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
      /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin);

    if (isExplicitlyAllowed || isVercelPreview || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`CORS policy violation: Origin '${origin}' is not authorized.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400, // 24 hours preflight cache
};

app.use(cors(corsOptions));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // max 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use('/api', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root Discovery Route
app.get('/', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        system: 'WHITEZA',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        healthCheck: '/api/v1/health',
      },
      'ShopSphere Backend Service is live and operational.'
    )
  );
});

// Health Check Route
app.get('/api/v1/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(
      200,
      {
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        system: 'ShopSphere Multi-Vendor Marketplace Backend',
        uptimeSeconds: Math.floor(process.uptime()),
      },
      'ShopSphere Backend Service is Healthy and Running'
    )
  );
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/deliveries', deliveryRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Centralized 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
