import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';
import notificationService from '../services/notificationService.js';
import db from '../models/index.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Send SMS notification (Doctors, Lab Technicians, Admins)
router.post('/sms',
  checkRole('Doctor', 'Lab Technician', 'Admin'),
  async (req, res) => {
    try {
      const { phoneNumber, message, patientId } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Phone number and message are required',
        });
      }

      // Use the service to send and log the SMS
      const result = await notificationService.sendSMS(phoneNumber, message, patientId);

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        data: result.data,
      });
    } catch (error) {
      console.error('Send SMS error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to send SMS',
      });
    }
  }
);

// Get notification history (Admins)
router.get('/history',
  checkRole('Admin'),
  async (req, res) => {
    try {
      // Fetch real notifications from database
      const notifications = await db.Notification.findAll({
        limit: 50,
        order: [['sentAt', 'DESC']],
        include: [{
          model: db.Patient,
          as: 'patient',
          include: [{
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }]
      });

      res.status(200).json({
        success: true,
        data: { notifications },
      });
    } catch (error) {
      console.error('Get notification history error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch notification history',
      });
    }
  }
);

export default router;
