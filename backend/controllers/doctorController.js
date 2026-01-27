import db from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import notificationService from '../services/notificationService.js';
import { Sequelize } from 'sequelize';

// Get active queues for doctor's department
const getActiveQueues = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // For now, we'll prioritized: 1. Query Param, 2. Derivation, 3. Default
    const doctorDepartment = req.query.department || await getDoctorDepartment(doctorId) || 'General Medicine';

    if (!doctorDepartment) {
      return res.status(400).json({
        error: 'Department Not Found',
        message: 'Doctor department not specified or found',
      });
    }

    // Get waiting patients for the doctor's department
    const activeQueues = await db.Queue.findAll({
      where: {
        department: doctorDepartment,
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
      order: [
        ['priority', 'DESC'], // Urgent patients first
        ['joinedAt', 'ASC'],  // Then by join time
      ],
    });

    // Get current patient in progress for this doctor
    const currentPatient = await db.Queue.findOne({
      where: {
        doctorId: doctorId,
        status: 'InProgress',
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
    });

    // Calculate statistics
    const stats = {
      totalWaiting: activeQueues.length,
      urgentCases: activeQueues.filter(q => q.priority === 'Urgent').length,
      highPriority: activeQueues.filter(q => q.priority === 'High').length,
      averageWaitTime: await calculateAverageWaitTime(doctorDepartment),
    };

    res.status(200).json({
      success: true,
      data: {
        department: doctorDepartment,
        currentPatient,
        waitingPatients: activeQueues,
        statistics: stats,
        doctorId,
      },
    });

  } catch (error) {
    console.error('Get active queues error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch active queues',
    });
  }
};

// Call next patient (change status from Waiting to InProgress)
const callNextPatient = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { department } = req.body;

    if (!department) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Department is required',
      });
    }

    // Check if doctor already has a patient in progress
    const currentInProgress = await db.Queue.findOne({
      where: {
        doctorId: doctorId,
        status: 'InProgress',
      },
    });

    if (currentInProgress) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Doctor already has a patient in progress',
        data: {
          currentPatient: currentInProgress,
        },
      });
    }

    // Find the next waiting patient based on priority and join time
    const nextPatient = await db.Queue.findOne({
      where: {
        department: department,
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
      order: [
        ['priority', 'DESC'], // Urgent patients first
        ['joinedAt', 'ASC'],  // Then by join time
      ],
    });

    if (!nextPatient) {
      return res.status(404).json({
        error: 'No Patients Waiting',
        message: 'No patients are currently waiting in this department',
      });
    }

    // Update the queue status to InProgress and assign to doctor
    const updatedQueue = await nextPatient.update({
      status: 'InProgress',
      doctorId: doctorId,
      serviceStartTime: new Date(),
      lastUpdated: new Date(),
    });

    // Send SMS notification to patient
    try {
      const message = `Dear ${nextPatient.patient.user.firstName}, you are now being served by Dr. ${req.user.firstName} ${req.user.lastName} at ${department}. Please proceed to the consultation room immediately.`;
      await notificationService.sendSMS(nextPatient.patient.user.phoneNumber, message);
    } catch (smsError) {
      console.error('Failed to send SMS notification:', smsError);
      // Continue with the process even if SMS fails
    }

    // Fetch the updated queue with all associations
    const calledPatient = await db.Queue.findByPk(updatedQueue.id, {
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
    });

    // Log the event
    await logActivity({
      userId: doctorId,
      type: 'QUEUE',
      action: 'CALL_PATIENT',
      description: `Dr. ${req.user.firstName} called patient ${calledPatient.queueNumber} into ${calledPatient.department}`,
      metadata: {
        queueNumber: calledPatient.queueNumber,
        patientId: calledPatient.patientId,
        department
      },
      req
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      console.log(`[SOCKET] Emitting queue update for ${department}`);
      io.emit('queue:updated', { department });
      io.emit('display:updated', { department });
      // Targeted event for the specific patient
      io.to(`patient:${calledPatient.patientId}`).emit('patient:called', {
        queueNumber: calledPatient.queueNumber,
        department,
        doctorName: `Dr. ${req.user.firstName} ${req.user.lastName}`
      });
    } else {
      console.warn('[SOCKET] Socket io instance not found in req.app during callNextPatient');
    }

    res.status(200).json({
      success: true,
      message: 'Next patient called successfully',
      data: {
        calledPatient,
        department,
        doctorId,
        smsSent: true,
      },
    });

  } catch (error) {
    console.error('Call next patient error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to call next patient',
    });
  }
};

// Complete current patient (change status from InProgress to Complete)
const completePatient = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { notes } = req.body;

    // Find the current patient in progress for this doctor
    const currentPatient = await db.Queue.findOne({
      where: {
        doctorId: doctorId,
        status: 'InProgress',
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
    });

    if (!currentPatient) {
      return res.status(404).json({
        error: 'No Patient In Progress',
        message: 'No patient is currently being served by this doctor',
      });
    }

    // Calculate actual service time
    const serviceEndTime = new Date();
    let actualServiceTime = null;

    if (currentPatient.serviceStartTime) {
      actualServiceTime = Math.round((serviceEndTime - currentPatient.serviceStartTime) / 60000); // minutes
    }

    // Update the queue status to Complete
    const updatedQueue = await currentPatient.update({
      status: 'Complete',
      serviceEndTime: serviceEndTime,
      actualWaitTime: actualServiceTime,
      notes: notes || currentPatient.notes,
      lastUpdated: new Date(),
    });

    // Log the event
    await logActivity({
      userId: doctorId,
      type: 'QUEUE',
      action: 'COMPLETE_PATIENT',
      description: `Dr. ${req.user.firstName} completed consultation for patient ${updatedQueue.queueNumber}`,
      metadata: {
        queueNumber: updatedQueue.queueNumber,
        patientId: updatedQueue.patientId,
        actualServiceTime
      },
      req
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('queue:updated', { department: updatedQueue.department });
      io.emit('display:updated', { department: updatedQueue.department });
      io.to(`patient:${updatedQueue.patientId}`).emit('patient:completed', {
        queueNumber: updatedQueue.queueNumber
      });
    }

    res.status(200).json({
      success: true,
      message: 'Patient consultation completed successfully',
      data: {
        completedPatient: updatedQueue,
        actualServiceTime,
        doctorId,
        smsSent: true,
      },
    });

  } catch (error) {
    console.error('Complete patient error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete patient consultation',
    });
  }
};

// Get doctor's queue statistics
const getQueueStatistics = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { department, dateRange = 'today' } = req.query;

    if (!department) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Department is required',
      });
    }

    // Calculate date range
    let startDate, endDate;
    const today = new Date();

    switch (dateRange) {
      case 'today':
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
        break;
      case 'week':
        startDate = new Date(today.setDate(today.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(today.setMonth(today.getMonth() - 1));
        endDate = new Date();
        break;
      default:
        startDate = new Date(today.setHours(0, 0, 0, 0));
        endDate = new Date(today.setHours(23, 59, 59, 999));
    }

    // Get statistics
    const stats = await db.Queue.findAll({
      where: {
        doctorId: doctorId,
        department: department,
        createdAt: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count'],
        [db.sequelize.fn('AVG', db.sequelize.col('actualWaitTime')), 'avgServiceTime'],
      ],
      group: ['status'],
      raw: true,
    });

    // Get total patients served
    const totalServed = await db.Queue.count({
      where: {
        doctorId: doctorId,
        department: department,
        status: 'Complete',
        createdAt: {
          [Sequelize.Op.between]: [startDate, endDate],
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        department,
        dateRange,
        statistics: stats,
        totalServed,
        doctorId,
      },
    });

  } catch (error) {
    console.error('Get queue statistics error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch queue statistics',
    });
  }
};

// Helper function to get doctor's department
const getDoctorDepartment = async (doctorId) => {
  try {
    //derivation logic
    let recentQueue = await db.Queue.findOne({
      where: { doctorId: doctorId },
      order: [['createdAt', 'DESC']],
      attributes: ['department'],
    });

    if (recentQueue) return recentQueue.department;

    // Fallback for demo: use the department with the most waiting patients
    const waitingQueue = await db.Queue.findOne({
      where: { status: 'Waiting' },
      order: [['createdAt', 'DESC']],
      attributes: ['department'],
    });

    return waitingQueue ? waitingQueue.department : 'General Medicine';
  } catch (error) {
    console.error('Error getting doctor department:', error);
    return null;
  }
};

// Helper function to calculate average wait time
const calculateAverageWaitTime = async (department) => {
  try {
    const result = await db.Queue.findAll({
      where: {
        department: department,
        status: 'Complete',
        actualWaitTime: {
          [Sequelize.Op.not]: null,
        },
        createdAt: {
          [Sequelize.Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      attributes: [
        [db.sequelize.fn('AVG', db.sequelize.col('actualWaitTime')), 'avgWaitTime'],
      ],
      raw: true,
    });

    return result[0]?.avgWaitTime ? Math.round(result[0].avgWaitTime) : 0;
  } catch (error) {
    console.error('Error calculating average wait time:', error);
    return 0;
  }
};

export { getActiveQueues, callNextPatient, completePatient, getQueueStatistics };
