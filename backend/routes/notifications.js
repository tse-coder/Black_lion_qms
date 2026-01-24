import express from 'express';
import { authenticateToken, checkRole } from '../middleware/auth.js';

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

      // Mock SMS service (as per project rules)
      console.log(`[SMS SENT TO ${phoneNumber}]: ${message}`);
      
      // In a real implementation, you would integrate with an SMS gateway
      // const response = await smsService.sendSMS(phoneNumber, message);

      res.status(200).json({
        success: true,
        message: 'SMS sent successfully',
        data: {
          phoneNumber,
          message,
          sentAt: new Date().toISOString(),
          patientId: patientId || null,
        },
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
      // Mock notification history
      const notifications = [
        {
          id: '1',
          type: 'SMS',
          recipient: '+251912345678',
          message: 'Your queue number is ready. Please proceed to the consultation room.',
          sentAt: new Date().toISOString(),
          status: 'sent',
          patientId: 'patient-uuid-1',
        },
        {
          id: '2',
          type: 'SMS',
          recipient: '+251923456789',
          message: 'Your lab results are ready for collection.',
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          status: 'sent',
          patientId: 'patient-uuid-2',
        },
      ];

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
