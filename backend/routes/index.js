import express from 'express';

const router = express.Router();

// Import route modules
import authRoutes from './auth.js';
import userRoutes from './users.js';
import patientRoutes from './patients.js';
import queueRoutes from './queues.js';
import notificationRoutes from './notifications.js';
import doctorRoutes from './doctor.js';
import displayRoutes from './display.js';
import appointmentRoutes from './appointment.js';
import adminRoutes from './admin.js';
import labTechnicianRoutes from './labTechnician.js';

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Black Lion Hospital DQMS API is running',
    timestamp: new Date().toISOString(),
  });
});

// Route definitions
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/patients', patientRoutes);
router.use('/queues', queueRoutes);
router.use('/notifications', notificationRoutes);
router.use('/api', displayRoutes);
router.use('/api', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/admin', adminRoutes);
router.use('/lab-technician', labTechnicianRoutes);

export default router;
