import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import db from '../models/index.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

// Admin only routes
router.get('/', checkRole('Admin'), async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Patient,
          as: 'patientProfile',
          required: false,
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch users',
    });
  }
});

// Get user by ID (Admin or own user)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin or requesting their own profile
    if (req.user.role !== 'Admin' && req.user.id !== id) {
      return res.status(403).json({
        error: 'Access Denied',
        message: 'You can only access your own profile',
      });
    }

    const user = await db.User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Patient,
          as: 'patientProfile',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user',
    });
  }
});

export default router;
