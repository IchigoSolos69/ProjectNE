"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env
dotenv_1.default.config();
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const cart_1 = __importDefault(require("./routes/cart"));
const orders_1 = __importDefault(require("./routes/orders"));
const admin_1 = __importDefault(require("./routes/admin"));
const addresses_1 = __importDefault(require("./routes/addresses"));
const wishlist_1 = __importDefault(require("./routes/wishlist"));
const seo_1 = __importDefault(require("./routes/seo"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
// Middleware
app.use((0, cors_1.default)({
    origin: FRONTEND_ORIGIN,
    credentials: true, // required for SameSite=None secure cookies
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Basic logging in dev
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}
// Register SEO routes at root (needed for search crawlers /sitemap.xml and /robots.txt)
app.use('/', seo_1.default);
// Register API Routes
app.use('/api/auth', auth_1.default);
app.use('/api', products_1.default); // handles /api/products and /api/categories
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/addresses', addresses_1.default);
app.use('/api/wishlist', wishlist_1.default);
// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
