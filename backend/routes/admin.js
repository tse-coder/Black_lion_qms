import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { getSystemStats, createUser } from '../controllers/adminController.js';
import { getActivityLogs } from '../controllers/activityController.js';
import { validate, userRegistrationSchema } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require Admin role
router.use(authenticateToken);
router.use(checkRole('Admin'));

// System stats
router.get('/stats', getSystemStats);

// Activity logs
router.get('/activities', getActivityLogs);

// Create user (Staff/Admin/Patient)
router.post('/users', validate(userRegistrationSchema), createUser);

export default router;
