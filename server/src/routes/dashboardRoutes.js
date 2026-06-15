import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(ensureAuthenticated);

// Route: GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

export default router;
