import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { verifyGoogleToken } from '../lib/google';
import { requireAuth, AuthenticatedRequest } from '../middleware/requireAuth';
import { emailService } from '../lib/emails';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rare_comforts_royal_luxury_sleep_secret_key_2026';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true, // Must be secure for SameSite=none
  sameSite: 'none' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Rate-limiting placeholders for recovery endpoints
const resetRequests = new Map<string, number>();

// Utility to generate token and set cookie
function sendAuthToken(res: Response, userId: string, userPayload: any) {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  
  res.cookie('session_token', token, COOKIE_OPTIONS);
  
  return res.status(200).json({
    user: userPayload,
    token, // For Option B fallback
  });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please fill in all fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    // Fire welcome email asynchronously
    emailService.sendWelcomeEmail(user.email, user.name);

    return sendAuthToken(res, user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register account.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter email and password.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    return sendAuthToken(res, user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required.' });
    }

    // Verify Google Token
    const googleProfile = await verifyGoogleToken(idToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: googleProfile.email },
    });

    let isNewUser = false;

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.googleId,
          role: 'CUSTOMER',
        },
      });
      isNewUser = true;
    } else if (!user.googleId) {
      // Link Google Account to existing email
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleProfile.googleId },
      });
    }

    if (isNewUser) {
      emailService.sendWelcomeEmail(user.email, user.name);
    }

    return sendAuthToken(res, user.id, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Google OAuth backend error:', error);
    return res.status(400).json({ error: 'Google authentication failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  return res.status(200).json({ user: req.user });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('session_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password - Generate password reset token
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    // Basic rate limit check (throttle recovery calls to max 1 per 60s per email)
    const lastRequestTime = resetRequests.get(email);
    if (lastRequestTime && Date.now() - lastRequestTime < 60000) {
      return res.status(429).json({ error: 'Please wait a minute before requesting another reset link.' });
    }
    resetRequests.set(email, Date.now());

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent credential harvesting
    if (!user) {
      return res.status(200).json({
        message: 'If that email address is registered, we have sent instructions to reset your password.',
      });
    }

    // Generate secure random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes expiry

    // Save hash to DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    // Send reset email asynchronously
    emailService.sendPasswordResetEmail(user.email, rawToken, user.name);

    return res.status(200).json({
      message: 'If that email address is registered, we have sent instructions to reset your password.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process password recovery request.' });
  }
});

// POST /api/auth/reset-password - Verify reset token and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Hash incoming raw token to lookup
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Password reset link is invalid or has expired.' });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Atomically update password, mark token used, invalidate other tokens
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
        },
        data: { used: true },
      }),
    ]);

    return res.status(200).json({ message: 'Your password has been reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
});

export default router;
