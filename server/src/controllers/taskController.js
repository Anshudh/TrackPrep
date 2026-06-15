import { validationResult } from 'express-validator';
import taskService from '../services/taskService.js';

export const getTasks = async (req, res, next) => {
  try {
    const { completed } = req.query;
    const tasks = await taskService.getTasks(req.user.id, { completed });
    return res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.user.id, req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

export const addTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const task = await taskService.addTask(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const task = await taskService.updateTask(req.user.id, req.params.id, req.body);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      data: task,
      message: 'Task updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const success = await taskService.deleteTask(req.user.id, req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
