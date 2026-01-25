import express from 'express';
import { login, getCurrentUser, logout } from '../controllers/authController.js';
import { register, createPatientProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, loginSchema, userRegistrationSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(userRegistrationSchema), register);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);
router.post('/create-patient-profile', authenticateToken, createPatientProfile);

export default router;
