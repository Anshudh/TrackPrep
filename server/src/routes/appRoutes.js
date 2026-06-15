import express from 'express';
import { body } from 'express-validator';
import {
  getApplications,
  getApplicationById,
  addApplication,
  updateApplication,
  deleteApplication
} from '../controllers/appController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(ensureAuthenticated);

const applicationValidator = [
  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required')
    .isLength({ max: 255 })
    .withMessage('Company name cannot exceed 255 characters'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ max: 255 })
    .withMessage('Role description cannot exceed 255 characters'),
  body('status')
    .isIn(['Applied', 'OA', 'Interview', 'Rejected', 'Offer'])
    .withMessage('Status must be one of: Applied, OA, Interview, Rejected, Offer'),
  body('applied_date')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('Applied date must be a valid date (YYYY-MM-DD)'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim(),
];

router.get('/', getApplications);
router.get('/:id', getApplicationById);
router.post('/', applicationValidator, addApplication);
router.put('/:id', applicationValidator, updateApplication);
router.delete('/:id', deleteApplication);

export default router;
