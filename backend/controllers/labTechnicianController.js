import db from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import notificationService from '../services/notificationService.js';

// Get pending queues for lab technician approval
const getPendingQueues = async (req, res) => {
  try {
    const pendingQueues = await db.Queue.findAll({
      where: { status: 'PendingLabApproval' },
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

    res.status(200).json({
      success: true,
      data: {
        queues: pendingQueues,
        totalPending: pendingQueues.length,
      },
    });
  } catch (error) {
    console.error('Get pending queues error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch pending queues',
    });
  }
};

// Approve queue (move to Waiting status)
const approveQueue = async (req, res) => {
  try {
    const { queueId } = req.body;

    if (!queueId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Queue ID is required',
      });
    }

    const queue = await db.Queue.findOne({
      where: { 
        id: queueId,
        status: 'PendingLabApproval'
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

    if (!queue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Queue not found or not in pending status',
      });
    }

    // Update queue status to Waiting
    await queue.update({
      status: 'Waiting',
      lastUpdated: new Date(),
    });

    // Send approval SMS
    const smsMessage = `Dear ${queue.patient.user.firstName}, your queue ${queue.queueNumber} has been approved. You are now in the main queue. Please wait to be called.`;
    
    try {
      await notificationService.sendSMS(queue.patient.user.phoneNumber, smsMessage);
    } catch (smsError) {
      console.error('Failed to send approval SMS:', smsError);
    }

    // Log the approval
    await logActivity({
      userId: req.user.id,
      type: 'QUEUE',
      action: 'LAB_APPROVAL',
      description: `Lab technician ${req.user.firstName} approved queue ${queue.queueNumber} for ${queue.patient.user.firstName}`,
      metadata: {
        queueId: queue.id,
        queueNumber: queue.queueNumber,
        department: queue.department,
      },
      req
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('queue:updated', { department: queue.department });
      io.emit('display:updated', { department: queue.department });
      io.emit('lab-queues:updated');
    }

    res.status(200).json({
      success: true,
      message: 'Queue approved successfully',
      data: { queue },
    });
  } catch (error) {
    console.error('Approve queue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to approve queue',
    });
  }
};

// Reject queue (cancel and notify)
const rejectQueue = async (req, res) => {
  try {
    const { queueId, reason } = req.body;

    if (!queueId) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Queue ID is required',
      });
    }

    const queue = await db.Queue.findOne({
      where: { 
        id: queueId,
        status: 'PendingLabApproval'
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

    if (!queue) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Queue not found or not in pending status',
      });
    }

    // Update queue status to Cancelled
    await queue.update({
      status: 'Cancelled',
      lastUpdated: new Date(),
      notes: reason || 'Rejected by lab technician',
    });

    // Send rejection SMS
    const smsMessage = `Dear ${queue.patient.user.firstName}, your queue ${queue.queueNumber} has been rejected. Reason: ${reason || 'Invalid information'}. Please contact reception for assistance.`;
    
    try {
      await notificationService.sendSMS(queue.patient.user.phoneNumber, smsMessage);
    } catch (smsError) {
      console.error('Failed to send rejection SMS:', smsError);
    }

    // Log the rejection
    await logActivity({
      userId: req.user.id,
      type: 'QUEUE',
      action: 'LAB_REJECTION',
      description: `Lab technician ${req.user.firstName} rejected queue ${queue.queueNumber} for ${queue.patient.user.firstName}`,
      metadata: {
        queueId: queue.id,
        queueNumber: queue.queueNumber,
        department: queue.department,
        reason: reason || 'No reason provided',
      },
      req
    });

    // Emit socket events
    const io = req.app.get('io');
    if (io) {
      io.emit('lab-queues:updated');
    }

    res.status(200).json({
      success: true,
      message: 'Queue rejected successfully',
      data: { queue },
    });
  } catch (error) {
    console.error('Reject queue error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reject queue',
    });
  }
};

export {
  getPendingQueues,
  approveQueue,
  rejectQueue,
};
