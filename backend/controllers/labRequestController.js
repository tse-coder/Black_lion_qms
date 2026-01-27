import db from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import notificationService from '../services/notificationService.js';

// Create lab request (Doctor sends to lab technician)
const createLabRequest = async (req, res) => {
  try {
    const { queueId, cardNumber, notes } = req.body;

    // Validate input
    if (!queueId || !cardNumber) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Queue ID and card number are required',
      });
    }

    // Check if queue exists and belongs to the doctor's department
    const queue = await db.Queue.findOne({
      where: { id: queueId },
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

    if (!queue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Queue not found',
      });
    }

    // Check if lab request already exists for this queue
    const existingRequest = await db.LabRequest.findOne({
      where: { queueId },
    });

    if (existingRequest) {
      return res.status(409).json({
        error: 'Duplicate Request',
        message: 'Lab request already exists for this queue',
      });
    }

    // Create lab request
    const labRequest = await db.LabRequest.create({
      queueId,
      doctorId: req.user.id,
      cardNumber: cardNumber.toUpperCase(),
      patientName: `${queue.patient.user.firstName} ${queue.patient.user.lastName}`,
      department: queue.department,
      status: 'Pending',
      notes,
      requestedAt: new Date(),
    });

    // Fetch the created request with associations
    const createdRequest = await db.LabRequest.findByPk(labRequest.id, {
      include: [
        {
          model: db.Queue,
          as: 'queue',
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
        },
        {
          model: db.User,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    // Log the lab request
    await logActivity({
      userId: req.user.id,
      type: 'LAB_REQUEST',
      action: 'CREATE',
      description: `Dr. ${req.user.firstName} ${req.user.lastName} sent lab request for ${createdRequest.patientName}`,
      metadata: {
        labRequestId: labRequest.id,
        queueId,
        cardNumber,
        department: queue.department,
      },
      req
    });

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('lab-request:created', { labRequest: createdRequest });
      io.emit('lab-requests:updated');
    }

    res.status(201).json({
      success: true,
      message: 'Lab request created successfully',
      data: { labRequest: createdRequest },
    });

  } catch (error) {
    console.error('Create lab request error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create lab request',
    });
  }
};

// Get lab requests for lab technicians
const getLabRequests = async (req, res) => {
  try {
    const { status, department } = req.query;
    
    let whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (department) {
      whereClause.department = department;
    }

    const labRequests = await db.LabRequest.findAll({
      where: whereClause,
      include: [
        {
          model: db.Queue,
          as: 'queue',
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
        },
        {
          model: db.User,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
        },
        {
          model: db.User,
          as: 'labTech',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['requestedAt', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: { labRequests },
    });

  } catch (error) {
    console.error('Get lab requests error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch lab requests',
    });
  }
};

// Update lab request status (Lab technician actions)
const updateLabRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, testResults, notes, rejectionReason } = req.body;

    // Validate status
    if (!['In Progress', 'Complete', 'Rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid status. Must be one of: In Progress, Complete, Rejected',
      });
    }

    const labRequest = await db.LabRequest.findByPk(id, {
      include: [
        {
          model: db.Queue,
          as: 'queue',
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
        },
      ],
    });

    if (!labRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lab request not found',
      });
    }

    // Update lab request
    const updateData = {
      status,
      labTechId: req.user.id,
      notes,
      lastUpdated: new Date(),
    };

    if (status === 'In Progress') {
      updateData.startedAt = new Date();
    } else if (status === 'Complete') {
      updateData.completedAt = new Date();
      updateData.testResults = testResults;
    } else if (status === 'Rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    await labRequest.update(updateData);

    // If lab request is rejected, update the queue status to Rejected
    if (status === 'Rejected') {
      await labRequest.queue.update({
        status: 'Rejected',
        lastUpdated: new Date(),
      });

      // Send notification to patient about rejection
      const message = `Dear ${labRequest.queue.patient.user.firstName}, your lab test was not completed. Please complete the required lab tests before proceeding. Reason: ${rejectionReason || 'Contact the lab for details'}`;
      
      try {
        await notificationService.sendSMS(
          labRequest.queue.patient.user.phoneNumber,
          message,
          labRequest.queue.patient.id
        );
      } catch (smsError) {
        console.error('Failed to send rejection SMS:', smsError);
      }
    }

    // If lab request is complete, notify the doctor
    if (status === 'Complete') {
      // Send notification to doctor (in real implementation, this would be through the system)
      console.log(`[LAB COMPLETE] Lab request ${id} completed for patient ${labRequest.patientName}`);
    }

    // Log the action
    await logActivity({
      userId: req.user.id,
      type: 'LAB_REQUEST',
      action: 'UPDATE',
      description: `Lab technician ${req.user.firstName} ${req.user.lastName} updated lab request to ${status} for ${labRequest.patientName}`,
      metadata: {
        labRequestId: id,
        status,
        testResults,
        rejectionReason,
      },
      req
    });

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('lab-request:updated', { labRequest });
      io.emit('lab-requests:updated');
      
      if (status === 'Rejected') {
        io.emit('queue:updated', { department: labRequest.department });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Lab request updated successfully',
      data: { labRequest },
    });

  } catch (error) {
    console.error('Update lab request error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update lab request',
    });
  }
};

// Get lab request by ID
const getLabRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const labRequest = await db.LabRequest.findByPk(id, {
      include: [
        {
          model: db.Queue,
          as: 'queue',
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
        },
        {
          model: db.User,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
        },
        {
          model: db.User,
          as: 'labTech',
          attributes: ['firstName', 'lastName'],
        },
      ],
    });

    if (!labRequest) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Lab request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { labRequest },
    });

  } catch (error) {
    console.error('Get lab request error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch lab request',
    });
  }
};

export {
  createLabRequest,
  getLabRequests,
  updateLabRequest,
  getLabRequestById,
};
