import { validationResult } from 'express-validator';
import appService from '../services/appService.js';

export const getApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const applications = await appService.getApplications(req.user.id, { status });
    return res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await appService.getApplicationById(req.user.id, req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    return res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

export const addApplication = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const application = await appService.addApplication(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      data: application,
      message: 'Application tracked successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  try {
    const application = await appService.updateApplication(req.user.id, req.params.id, req.body);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      data: application,
      message: 'Application updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req, res, next) => {
  try {
    const success = await appService.deleteApplication(req.user.id, req.params.id);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};
