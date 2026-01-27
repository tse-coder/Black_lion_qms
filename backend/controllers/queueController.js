import db from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import notificationService from '../services/notificationService.js';
import { Sequelize } from 'sequelize';

// Generate department-specific queue number
const generateQueueNumber = async (department) => {
  try {
    // Get department code (first 4 letters, uppercase)
    const deptCode = department.substring(0, 4).toUpperCase();

    // Find the latest queue number for this department today to avoid collisions
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastQueue = await db.Queue.findOne({
      where: {
        department: department,
        createdAt: { [Sequelize.Op.gte]: today },
        queueNumber: { [Sequelize.Op.like]: `${deptCode}-%` }
      },
      order: [['createdAt', 'DESC']],
    });

    let nextNum = 1;
    if (lastQueue) {
      const parts = lastQueue.queueNumber.split('-');
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }

    // Robust unique check loop
    let isUnique = false;
    let queueNumber;
    while (!isUnique) {
      queueNumber = `${deptCode}-${String(nextNum).padStart(3, '0')}`;
      const existing = await db.Queue.findOne({ where: { queueNumber } });
      if (!existing) {
        isUnique = true;
      } else {
        nextNum++;
      }
    }

    return queueNumber;
  } catch (error) {
    console.error('Error generating queue number:', error);
    throw new Error('Failed to generate queue number');
  }
};

// Estimate wait time based on current queues
const estimateWaitTime = async (department) => {
  try {
    // Count active queues (Waiting and InProgress) for this department
    const activeQueues = await db.Queue.count({
      where: {
        department: department,
        status: ['Waiting', 'InProgress'],
      },
    });

    // Average service time (mock calculation - in real implementation, this would be based on historical data)
    const averageServiceTime = 15; // minutes per patient
    const estimatedWaitTime = activeQueues * averageServiceTime;

    return estimatedWaitTime;
  } catch (error) {
    console.error('Error estimating wait time:', error);
    return 15; // Default 15 minutes
  }
};

// Request queue number (Patient Check-in)
const requestQueueNumber = async (req, res) => {
  try {
    const { cardNumber, department, priority = 'Medium' } = req.body;

    // Validate input
    if (!cardNumber || !department) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Card number and department are required',
      });
    }

    // Step 1: Validate patient card via database
    const formattedCardNumber = cardNumber.trim().toUpperCase();
    
    // Find patient directly in the database
    let patient = await db.Patient.findOne({
      where: { cardNumber: formattedCardNumber },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phoneNumber'],
        },
      ],
    });

    if (!patient) {
      return res.status(404).json({
        error: 'Patient Not Found',
        message: 'No patient found with this card number. Please register first.',
      });
    }

    // Step 2: Check if patient already has an active queue for the same department
    const existingQueue = await db.Queue.findOne({
      where: {
        patientId: patient.id,
        department: department,
        status: ['Waiting', 'InProgress'],
      },
    });

    if (existingQueue) {
      return res.status(409).json({
        error: 'Duplicate Queue Entry',
        message: 'Patient already has an active queue for this department',
        data: {
          queueNumber: existingQueue.queueNumber,
          status: existingQueue.status,
          joinedAt: existingQueue.joinedAt,
        },
      });
    }

    // Step 3: Generate queue number and estimate wait time
    const queueNumber = await generateQueueNumber(department);
    const estimatedWaitTime = await estimateWaitTime(department);

    // Step 4: Create queue entry with status 'Waiting'
    const queue = await db.Queue.create({
      queueNumber,
      patientId: patient.id,
      department,
      priority,
      status: 'Waiting',
      estimatedWaitTime,
      joinedAt: new Date(),
      lastUpdated: new Date(),
    });

    // Step 5: Send SMS notification to patient
    const smsMessage = `Dear ${patient.user.firstName}, your queue number is ${queueNumber} for ${department}. Current wait time: approximately ${estimatedWaitTime} minutes. Please be ready.`;

    try {
      await notificationService.sendSMS(patient.user.phoneNumber, smsMessage);
    } catch (smsError) {
      console.error('Failed to send SMS notification:', smsError);
      // Continue with the process even if SMS fails
    }
    // Step 6: Fetch the complete queue entry with associations
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
      ],
    });

    // Log the check-in
    await logActivity({
      userId: patient.userId,
      type: 'QUEUE',
      action: 'CHECK_IN',
      description: `Patient ${patient.user.firstName} checked in for ${department}`,
      metadata: {
        queueNumber: queue.queueNumber,
        department
      },
      req
    });

    // Step 7: Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('queue:updated', { department });
      io.emit('display:updated', { department });
    }

    res.status(201).json({
      success: true,
      message: 'Queue number assigned successfully',
      data: {
        queue: createdQueue,
        patientInfo: {
          name: `${patient.user.firstName} ${patient.user.lastName}`,
          cardNumber: patient.cardNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
        },
        estimatedWaitTime,
        smsSent: true,
      },
    });

  } catch (error) {
    console.error('Request queue number error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to request queue number',
    });
  }
};

// Get queue status by queue number
const getQueueStatus = async (req, res) => {
  try {
    const { queueNumber } = req.params;

    const queue = await db.Queue.findOne({
      where: { queueNumber },
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

    if (!queue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Queue not found',
      });
    }

    // Calculate current position in queue
    const position = await db.Queue.count({
      where: {
        department: queue.department,
        serviceType: queue.serviceType,
        status: 'Waiting',
        createdAt: {
          [Sequelize.Op.lt]: queue.createdAt,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        queue,
        position: position + 1, // +1 because count starts from 0
        estimatedWaitTime: queue.estimatedWaitTime,
      },
    });

  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get queue status',
    });
  }
};

export { requestQueueNumber, getQueueStatus };
