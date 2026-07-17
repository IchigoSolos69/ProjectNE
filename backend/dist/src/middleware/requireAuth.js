"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
async function requireAuth(req, res, next) {
    try {
        let token = '';
        // 1. Try reading token from HTTP-Only cookie (Option A)
        if (req.cookies && req.cookies.session_token) {
            token = req.cookies.session_token;
        }
        // 2. Fall back to Authorization Header (Option B)
        else if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ error: 'Authentication required. Please sign in.' });
        }
        const jwtSecret = process.env.JWT_SECRET || 'rare_comforts_royal_luxury_sleep_secret_key_2026';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
            },
        });
        if (!user) {
            return res.status(401).json({ error: 'User session not found or invalid.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }
}
function requireAdmin(req, res, next) {
    // First run requireAuth check
    requireAuth(req, res, (err) => {
        if (err)
            return next(err);
        if (!req.user || req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
        }
        next();
    });
}
