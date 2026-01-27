import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { createLabRequest, getLabRequests, updateLabRequest, getLabRequestById } from '../controllers/labRequestController.js';
import Joi from 'joi';

const router = express.Router();

// All lab request routes require authentication
router.use(authenticateToken);

// Validation schemas
const createLabRequestSchema = Joi.object({
  queueId: Joi.string().uuid().required().messages({
    'string.uuid': 'Queue ID must be a valid UUID',
    'any.required': 'Queue ID is required',
  }),
  cardNumber: Joi.string().required().messages({
    'any.required': 'Card number is required',
    'string.empty': 'Card number cannot be empty',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
});

const updateLabRequestSchema = Joi.object({
  status: Joi.string().valid('In Progress', 'Complete', 'Rejected').required().messages({
    'any.only': 'Status must be one of: In Progress, Complete, Rejected',
    'any.required': 'Status is required',
  }),
  testResults: Joi.string().max(2000).optional().messages({
    'string.max': 'Test results must not exceed 2000 characters',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
  rejectionReason: Joi.string().max(500).optional().messages({
    'string.max': 'Rejection reason must not exceed 500 characters',
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

// Lab Request Routes

// POST /api/lab-requests - Create lab request (Doctors only)
router.post('/', 
  checkRole('Doctor'),
  validate(createLabRequestSchema),
  createLabRequest
);

// GET /api/lab-requests - Get lab requests (Lab Technicians and Doctors)
router.get('/', 
  checkRole('Doctor', 'Lab Technician'),
  getLabRequests
);

// GET /api/lab-requests/:id - Get lab request by ID (Lab Technicians and Doctors)
router.get('/:id', 
  checkRole('Doctor', 'Lab Technician'),
  getLabRequestById
);

// PATCH /api/lab-requests/:id - Update lab request status (Lab Technicians only)
router.patch('/:id', 
  checkRole('Lab Technician'),
  validate(updateLabRequestSchema),
  updateLabRequest
);

export default router;
