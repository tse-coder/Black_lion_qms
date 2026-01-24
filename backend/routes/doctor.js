import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { getActiveQueues, callNextPatient, completePatient, getQueueStatistics } from '../controllers/doctorController.js';
import Joi from 'joi';

const router = express.Router();

// All doctor routes require authentication and Doctor role
router.use(authenticateToken);
router.use(checkRole('Doctor'));

// Validation schemas
const callNextPatientSchema = Joi.object({
  department: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Department name must be at least 2 characters long',
    'string.max': 'Department name must not exceed 100 characters',
    'any.required': 'Department is required',
  }),
});

const completePatientSchema = Joi.object({
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
});

// Middleware for validation
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errorMessages,
      });
    }
    
    next();
  };
};

// Doctor Queue Management Routes

// GET /api/queue/active - Get active queues for doctor's department
router.get('/queue/active', getActiveQueues);

// PATCH /api/queue/call-next - Call next patient (Waiting -> InProgress)
router.patch('/queue/call-next', validate(callNextPatientSchema), callNextPatient);

// PATCH /api/queue/complete - Complete current patient (InProgress -> Complete)
router.patch('/queue/complete', validate(completePatientSchema), completePatient);

// GET /api/queue/statistics - Get doctor's queue statistics
router.get('/queue/statistics', getQueueStatistics);

export default router;
