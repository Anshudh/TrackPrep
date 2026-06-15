import express from 'express';
import { body } from 'express-validator';
import {
  getProblems,
  getProblemById,
  addProblem,
  updateProblem,
  deleteProblem
} from '../controllers/problemController.js';
import { ensureAuthenticated } from '../middleware/authMiddleware.js';

const router = express.Router();

// Require auth for all problem endpoints
router.use(ensureAuthenticated);

// Validation rules
const problemValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 255 })
    .withMessage('Title cannot exceed 255 characters'),
  body('platform')
    .isIn(['LeetCode', 'Codeforces', 'CodeChef', 'Other'])
    .withMessage('Platform must be one of: LeetCode, Codeforces, CodeChef, Other'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be one of: Easy, Medium, Hard'),
  body('topic')
    .isIn(['Array', 'String', 'Linked List', 'Tree', 'Graph', 'DP', 'Greedy', 'Other'])
    .withMessage('Topic must be one of: Array, String, Linked List, Tree, Graph, DP, Greedy, Other'),
  body('solved_date')
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage('Solved date must be a valid date (YYYY-MM-DD)'),
  body('problem_url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Problem URL must be a valid web link'),
];

// Routes
router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', problemValidator, addProblem);
router.put('/:id', problemValidator, updateProblem);
router.delete('/:id', deleteProblem);

export default router;
