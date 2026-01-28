import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import Joi from 'joi';
import {
  getPendingQueues,
  approveQueue,
  rejectQueue,
} from '../controllers/labTechnicianController.js';

const router = express.Router();

// All lab technician routes require authentication and Lab Technician role
router.use(authenticateToken);
router.use(checkRole('Lab Technician'));

// Validation schemas
const approveQueueSchema = Joi.object({
  queueId: Joi.string().uuid().required().messages({
    'string.uuid': 'Queue ID must be a valid UUID',
    'any.required': 'Queue ID is required',
  }),
});

const rejectQueueSchema = Joi.object({
  queueId: Joi.string().uuid().required().messages({
    'string.uuid': 'Queue ID must be a valid UUID',
    'any.required': 'Queue ID is required',
  }),
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Reason must not exceed 500 characters',
  }),
});

// Lab Technician Queue Management Routes

// GET /lab-technician/pending - Get pending queues for lab technician approval
router.get('/pending', getPendingQueues);

// POST /lab-technician/approve - Approve queue (move to main queue)
router.post('/approve', validate(approveQueueSchema), approveQueue);

// POST /lab-technician/reject - Reject queue (cancel and notify)
router.post('/reject', validate(rejectQueueSchema), rejectQueue);

export default router;
