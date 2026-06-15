import { validationResult } from 'express-validator';
import problemService from '../services/problemService.js';

export const getProblems = async (req, res, next) => {
  try {
    const { search, platform, difficulty, topic } = req.query;
    const problems = await problemService.getProblems(req.user.id, {
      search,
      platform,
      difficulty,
      topic
    });
    return res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  try {
    const problem = await problemService.getProblemById(req.user.id, req.params.id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: problem
    });
  } catch (error) {
    next(error);
  }
};

export const addProblem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const problem = await problemService.addProblem(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      data: problem,
      message: 'Problem tracked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const problem = await problemService.updateProblem(req.user.id, req.params.id, req.body);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      data: problem,
      message: 'Problem updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const success = await problemService.deleteProblem(req.user.id, req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Problem deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
