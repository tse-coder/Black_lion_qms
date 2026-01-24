import express from 'express';
import { login, getCurrentUser, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, loginSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

export default router;
