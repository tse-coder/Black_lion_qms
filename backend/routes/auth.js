import express from 'express';
import { login, getCurrentUser, logout } from '../controllers/authController.js';
import { register, updateProfile, changePassword } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, loginSchema, userRegistrationSchema, updateProfileSchema, changePasswordSchema } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/login', validate(loginSchema), login);
router.post('/register', validate(userRegistrationSchema), register);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);
router.put('/profile', authenticateToken, validate(updateProfileSchema), updateProfile);
router.put('/change-password', authenticateToken, validate(changePasswordSchema), changePassword);

export default router;
