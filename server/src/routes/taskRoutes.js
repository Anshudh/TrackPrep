import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  addTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(ensureAuthenticated);

const taskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 255 })
    .withMessage('Task title cannot exceed 255 characters'),
  body('deadline')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('Deadline must be a valid date (YYYY-MM-DD)'),
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Completed status must be a boolean'),
];

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', taskValidator, addTask);
router.put('/:id', taskValidator, updateTask);
router.delete('/:id', deleteTask);

export default router;
