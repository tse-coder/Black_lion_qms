import db from '../models/index.js';
import emrService from '../services/emrService.js';
import notificationService from '../services/notificationService.js';
import { Sequelize } from 'sequelize';

// Generate department-specific queue number
const generateQueueNumber = async (department, serviceType) => {
  try {
    // Get department code (first 4 letters, uppercase)
    const deptCode = department.substring(0, 4).toUpperCase();
    
    // Count queues for this department today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const queueCount = await db.Queue.count({
      where: {
        department: department,
        createdAt: {
          [Sequelize.Op.gte]: today,
        },
      },
    });

    // Generate queue number with padding (e.g., CARD-001)
    const queueNumber = `${deptCode}-${String(queueCount + 1).padStart(3, '0')}`;
    
    return queueNumber;
  } catch (error) {
    console.error('Error generating queue number:', error);
    throw new Error('Failed to generate queue number');
  }
};

// Estimate wait time based on current queues
const estimateWaitTime = async (department, serviceType) => {
  try {
    // Count active queues (Waiting and InProgress) for this department
    const activeQueues = await db.Queue.count({
      where: {
        department: department,
        serviceType: serviceType,
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
    const { cardNumber, department, serviceType, priority = 'Medium' } = req.body;

    // Validate input
    if (!cardNumber || !department || !serviceType) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Card number, department, and service type are required',
      });
    }

    // Step 1: Validate patient card via EMR
    const emrValidation = await emrService.validatePatientCard(cardNumber);
    
    if (!emrValidation.success) {
      return res.status(404).json({
        error: 'EMR Validation Failed',
        message: emrValidation.message || 'Patient card validation failed',
      });
    }

    const patientData = emrValidation.data;

    // Step 2: Find or create patient in local database
    let patient = await db.Patient.findOne({
      where: { cardNumber: cardNumber },
      include: [
        {
          model: db.User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'phoneNumber'],
        },
      ],
    });

    if (!patient) {
      // Create new patient record if not found
      // First, create user account if doesn't exist
      let user = await db.User.findOne({
        where: { email: `${patientData.cardNumber}@patient.blacklion.gov.et` },
      });

      if (!user) {
        user = await db.User.create({
          username: `patient_${patientData.cardNumber}`,
          email: `${patientData.cardNumber}@patient.blacklion.gov.et`,
          password: 'TempPassword123!', // In real implementation, this would be sent via SMS
          role: 'Patient',
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          phoneNumber: patientData.phoneNumber,
        });
      }

      // Create patient profile
      patient = await db.Patient.create({
        userId: user.id,
        cardNumber: patientData.cardNumber,
        medicalRecordNumber: patientData.medicalRecordNumber,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address || '',
        emergencyContactName: patientData.emergencyContactName || '',
        emergencyContactPhone: patientData.emergencyContactPhone || '',
        bloodType: patientData.bloodType,
        allergies: patientData.allergies || '',
        chronicConditions: patientData.chronicConditions || '',
      });

      // Fetch the created patient with user data
      patient = await db.Patient.findByPk(patient.id, {
        include: [
          {
            model: db.User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'phoneNumber'],
          },
        ],
      });
    }

    // Step 3: Check if patient already has an active queue for the same service
    const existingQueue = await db.Queue.findOne({
      where: {
        patientId: patient.id,
        serviceType: serviceType,
        department: department,
        status: ['Waiting', 'InProgress'],
      },
    });

    if (existingQueue) {
      return res.status(409).json({
        error: 'Duplicate Queue Entry',
        message: 'Patient already has an active queue for this service',
        data: {
          queueNumber: existingQueue.queueNumber,
          status: existingQueue.status,
          joinedAt: existingQueue.joinedAt,
        },
      });
    }

    // Step 4: Generate queue number and estimate wait time
    const queueNumber = await generateQueueNumber(department, serviceType);
    const estimatedWaitTime = await estimateWaitTime(department, serviceType);

    // Step 5: Create queue entry with status 'Waiting'
    const queue = await db.Queue.create({
      queueNumber,
      patientId: patient.id,
      serviceType,
      department,
      priority,
      status: 'Waiting',
      estimatedWaitTime,
      joinedAt: new Date(),
      lastUpdated: new Date(),
    });

    // Step 6: Send SMS notification to patient
    const smsMessage = `Dear ${patient.user.firstName}, your queue number is ${queueNumber} for ${serviceType} at ${department}. Current wait time: approximately ${estimatedWaitTime} minutes. Please be ready.`;
    
    try {
      await notificationService.sendSMS(patient.user.phoneNumber, smsMessage);
    } catch (smsError) {
      console.error('Failed to send SMS notification:', smsError);
      // Continue with the process even if SMS fails
    }

    // Step 7: Fetch the complete queue entry with associations
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
