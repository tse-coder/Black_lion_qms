import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import { validate, queueSchema } from '../middleware/validation.js';
import { requestQueueNumber, getQueueStatus } from '../controllers/queueController.js';
import { validate as validateQueue, queueRequestSchema } from '../middleware/queueValidation.js';
import db from '../models/index.js';

const router = express.Router();
const { Sequelize } = db;

// Public endpoint for requesting queue number (Patient Check-in)
router.post('/request', validateQueue(queueRequestSchema), requestQueueNumber);

// Public endpoint for checking queue status
router.get('/status/:queueNumber', getQueueStatus);

// All other queue routes require authentication
router.use(authenticateToken);

// Get queues based on user role
router.get('/', async (req, res) => {
  try {
    let whereClause = {};
    let include = [
      {
        model: db.Patient,
        as: 'patient',
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber'],
          },
        ],
      },
    ];

    // Role-based filtering
    switch (req.user.role) {
      case 'Patient':
        // Patients can only see their own queues
        const patientProfile = await db.Patient.findOne({
          where: { userId: req.user.id },
        });
        if (patientProfile) {
          whereClause.patientId = patientProfile.id;
        }
        break;
      
      case 'Doctor':
        // Doctors can see queues assigned to them and queues in their department
        whereClause = {
          [Sequelize.Op.or]: [
            { doctorId: req.user.id },
            { department: req.user.department }, // Assuming doctors have a department field
          ],
        };
        break;
      
      case 'Admin':
        // Admins can see all queues
        include.push({
          model: db.User,
          as: 'doctor',
          attributes: ['firstName', 'lastName', 'role'],
        });
        break;
    }

    const queues = await db.Queue.findAll({
      where: whereClause,
      include,
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: { queues },
    });
  } catch (error) {
    console.error('Get queues error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch queues',
    });
  }
});

// Create new queue (Doctors, Lab Technicians, Admins)
router.post('/', 
  checkRole('Doctor', 'Lab Technician', 'Admin'),
  validate(queueSchema),
  async (req, res) => {
    try {
      const { patientId, department, priority, notes } = req.body;

      // Generate unique queue number
      const queueCount = await db.Queue.count({
        where: {
          department,
          createdAt: {
            [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      const deptCode = department.substring(0, 3).toUpperCase();
      const queueNumber = `${deptCode}-${String(queueCount + 1).padStart(3, '0')}`;

      // Assign doctor if not provided and user is a doctor
      let doctorId = req.body.doctorId;
      if (!doctorId && req.user.role === 'Doctor') {
        doctorId = req.user.id;
      }

      const queue = await db.Queue.create({
        queueNumber,
        patientId,
        department,
        doctorId,
        priority: priority || 'Medium',
        status: 'Waiting',
        joinedAt: new Date(),
        lastUpdated: new Date(),
        notes: notes || null,
      });

      // Fetch the created queue with associations
      const createdQueue = await db.Queue.findByPk(queue.id, {
        include: [
          {
            model: db.Patient,
            as: 'patient',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'phoneNumber'],
              },
            ],
          },
          {
            model: db.User,
            as: 'doctor',
            attributes: ['firstName', 'lastName'],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Queue entry created successfully',
        data: { queue: createdQueue },
      });
    } catch (error) {
      console.error('Create queue error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create queue entry',
      });
    }
  }
);

// Update queue status (Doctors, Lab Technicians, Admins)
router.put('/:id/status', 
  checkRole('Doctor', 'Lab Technician', 'Admin'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['Waiting', 'InProgress', 'Complete', 'Cancelled'].includes(status)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid status. Must be one of: Waiting, InProgress, Complete, Cancelled',
        });
      }

      const queue = await db.Queue.findByPk(id);
      if (!queue) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Queue not found',
        });
      }

      // Update timestamps based on status
      const updateData = { status, lastUpdated: new Date() };
      
      if (status === 'InProgress' && queue.status === 'Waiting') {
        updateData.serviceStartTime = new Date();
      } else if (status === 'Complete' && queue.status === 'InProgress') {
        updateData.serviceEndTime = new Date();
        // Calculate actual wait time
        if (queue.serviceStartTime) {
          const waitTime = Math.round((new Date() - queue.serviceStartTime) / 60000); // minutes
          updateData.actualWaitTime = waitTime;
        }
      }

      await queue.update(updateData);

      res.status(200).json({
        success: true,
        message: 'Queue status updated successfully',
        data: { queue },
      });
    } catch (error) {
      console.error('Update queue status error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update queue status',
      });
    }
  }
);

// Call next patient (Doctors, Lab Technicians, Admins)
router.put('/:queueId/next', 
  checkRole('Doctor', 'Lab Technician', 'Admin'),
  async (req, res) => {
    try {
      const { queueId } = req.params;

      // Find the current queue
      const currentQueue = await db.Queue.findByPk(queueId);
      if (!currentQueue) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Queue not found',
        });
      }

      // Mark current queue as complete
      await currentQueue.update({
        status: 'Complete',
        serviceEndTime: new Date(),
        lastUpdated: new Date(),
      });

      // Find next waiting patient in the same department
      const nextQueue = await db.Queue.findOne({
        where: {
          department: currentQueue.department,
          status: 'Waiting',
        },
        include: [
          {
            model: db.Patient,
            as: 'patient',
            include: [
              {
                model: db.User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'phoneNumber'],
              },
            ],
          },
        ],
        order: [['createdAt', 'ASC']],
      });

      if (nextQueue) {
        // Update next queue to InProgress
        await nextQueue.update({
          status: 'InProgress',
          serviceStartTime: new Date(),
          doctorId: req.user.id,
          lastUpdated: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        message: nextQueue ? 'Next patient called successfully' : 'No more patients in queue',
        data: {
          previousQueue: currentQueue,
          nextQueue: nextQueue || null,
        },
      });
    } catch (error) {
      console.error('Call next patient error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to call next patient',
      });
    }
  }
);

// Get patient profile (Patients only)
router.get('/patient-profile', 
  checkRole('Patient'),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Find patient profile for the authenticated user
      const patient = await db.Patient.findOne({
        where: { userId },
        attributes: ['id', 'cardNumber', 'medicalRecordNumber', 'dateOfBirth', 'gender', 'bloodType', 'allergies', 'chronicConditions'],
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber', 'email'],
          },
        ],
      });

      if (!patient) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Patient profile not found',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          patient: {
            id: patient.id,
            cardNumber: patient.cardNumber,
            medicalRecordNumber: patient.medicalRecordNumber,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            bloodType: patient.bloodType,
            allergies: patient.allergies,
            chronicConditions: patient.chronicConditions,
            user: patient.user,
          },
        },
      });
    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch patient profile',
      });
    }
  }
);

export default router;
