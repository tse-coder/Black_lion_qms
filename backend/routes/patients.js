import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import db from '../models/index.js';

const router = express.Router();
const { Sequelize } = db;

// All patient routes require authentication
router.use(authenticateToken);

// Get patients based on user role
router.get('/', async (req, res) => {
  try {
    let whereClause = {};

    // Role-based filtering
    switch (req.user.role) {
      case 'Patient':
        // Patients can only see their own profile
        const patientProfile = await req.db.Patient.findOne({
          where: { userId: req.user.id },
        });
        if (patientProfile) {
          whereClause.id = patientProfile.id;
        }
        break;
      
      case 'Doctor':
      case 'Lab Technician':
        // Doctors and Lab Technicians can see patients in their queues
        const queues = await db.Queue.findAll({
          where: {
            [Sequelize.Op.or]: [
              { doctorId: req.user.id },
              { status: 'Waiting' }, // Can see waiting patients
            ],
          },
          attributes: ['patientId'],
        });
        whereClause.id = queues.map(q => q.patientId);
        break;
      
      case 'Admin':
        // Admins can see all patients
        break;
    }

    const patients = await db.Patient.findAll({
      where: whereClause,
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'role'],
        },
        {
          model: db.Queue,
          as: 'queues',
          limit: 5, // Limit to recent queues
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: { patients },
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch patients',
    });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions
    if (req.user.role === 'Patient') {
      const patientProfile = await db.Patient.findOne({
        where: { userId: req.user.id },
      });
      if (!patientProfile || patientProfile.id !== id) {
        return res.status(403).json({
          error: 'Access Denied',
          message: 'You can only access your own profile',
        });
      }
    }

    const patient = await db.Patient.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'role'],
        },
        {
          model: db.Queue,
          as: 'queues',
          include: [
            {
              model: db.User,
              as: 'doctor',
              attributes: ['firstName', 'lastName'],
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Patient not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { patient },
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch patient',
    });
  }
});

export default router;
