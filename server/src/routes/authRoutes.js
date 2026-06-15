import express from 'express';
import passport from 'passport';
import { getMe, logout, mockLogin } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Route: GET /api/auth/google
router.get(
  '/google',
  authLimiter,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route: GET /api/auth/google/callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed`
  }),
  (req, res) => {
    // Successful login, redirect to frontend dashboard
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
  }
);

// Route: GET /api/auth/logout
router.get('/logout', logout);

// Route: GET /api/auth/me
router.get('/me', getMe);

// Route: GET /api/auth/mock (Developer Bypass)
router.get('/mock', authLimiter, mockLogin);

export default router;
