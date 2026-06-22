import express from 'express';
import passport from 'passport';
import { getMe, logout, mockLogin } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

const checkGoogleConfig = (req, res, next) => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const hasGoogleCreds = clientID && clientID !== 'placeholder_client_id' && clientSecret && clientSecret !== 'placeholder_client_secret';

  if (!hasGoogleCreds) {
    return res.status(500).json({
      success: false,
      message: 'Google OAuth credentials are not configured in your backend environment variables on Railway. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your backend variables.'
    });
  }
  next();
};

// Route: GET /api/auth/google
router.get(
  '/google',
  authLimiter,
  checkGoogleConfig,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Route: GET /api/auth/google/callback
router.get(
  '/google/callback',
  checkGoogleConfig,
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
