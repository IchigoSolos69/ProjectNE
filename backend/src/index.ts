import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

import authRouter from './routes/auth';
import productsRouter from './routes/products';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import addressesRouter from './routes/addresses';
import wishlistRouter from './routes/wishlist';
import seoRouter from './routes/seo';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true, // required for SameSite=None secure cookies
  })
);
app.use(express.json());
app.use(cookieParser());

// Basic logging in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Register SEO routes at root (needed for search crawlers /sitemap.xml and /robots.txt)
app.use('/', seoRouter);

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api', productsRouter); // handles /api/products and /api/categories
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/wishlist', wishlistRouter);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error occurred.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✨ RareComforts API Server is running on port ${PORT}`);
  console.log(`👉 Accepting cross-origin requests from ${FRONTEND_ORIGIN}`);
});
