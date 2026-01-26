import db from '../models/index.js';
import { Sequelize } from 'sequelize';

// Get currently serving numbers for all departments (Public Display)
const getQueueDisplay = async (req, res) => {
  try {
    // List of predefined departments for consistent high-end UI
    const PREDEFINED_DEPARTMENTS = [
      'Cardiology',
      'Laboratory',
      'Radiology',
      'Pharmacy',
      'Emergency',
      'General Medicine',
      'Orthopedics',
      'Pediatrics',
    ];

    const departmentQueues = [];

    // For each department, get current serving and waiting patients
    for (const departmentName of PREDEFINED_DEPARTMENTS) {

      // Get currently serving patient (InProgress)
      const currentServing = await db.Queue.findOne({
        where: {
          department: departmentName,
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
                attributes: ['firstName', 'lastName'],
              },
            ],
          },
          {
            model: db.User,
            as: 'doctor',
            attributes: ['firstName', 'lastName'],
          },
        ],
        order: [['serviceStartTime', 'ASC']],
      });

      // Get next 5 waiting patients
      const waitingPatients = await db.Queue.findAll({
        where: {
          department: departmentName,
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
                attributes: ['firstName', 'lastName'],
              },
            ],
          },
        ],
        order: [
          ['priority', 'DESC'], // Urgent patients first
          ['joinedAt', 'ASC'],  // Then by join time
        ],
        limit: 5,
      });

      // Get department statistics
      const stats = await db.Queue.findAll({
        where: {
          department: departmentName,
          status: ['Waiting', 'InProgress'],
        },
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        ],
        group: ['status'],
        raw: true,
      });

      const waitingCount = stats.find(s => s.status === 'Waiting')?.count || 0;
      const inProgressCount = stats.find(s => s.status === 'InProgress')?.count || 0;

      // Calculate estimated wait times
      const avgWaitTime = await calculateAverageWaitTime(departmentName);

      departmentQueues.push({
        department: departmentName,
        currentlyServing: currentServing ? {
          queueNumber: currentServing.queueNumber,
          patientName: `${currentServing.patient.user.firstName} ${currentServing.patient.user.lastName}`,
          doctorName: currentServing.doctor ? `${currentServing.doctor.firstName} ${currentServing.doctor.lastName}` : 'Assigned',
          serviceStartTime: currentServing.serviceStartTime,
          estimatedDuration: avgWaitTime,
        } : null,
        waitingPatients: waitingPatients.map(patient => ({
          queueNumber: patient.queueNumber,
          patientName: `${patient.patient.user.firstName} ${patient.patient.user.lastName}`,
          priority: patient.priority,
          joinedAt: patient.joinedAt,
          estimatedWaitTime: calculateEstimatedWaitTime(patient, waitingCount),
        })),
        statistics: {
          totalWaiting: waitingCount,
          currentlyInProgress: inProgressCount,
          averageWaitTime: avgWaitTime,
          lastUpdated: new Date().toISOString(),
        },
      });
    }

    // Sort departments alphabetically
    departmentQueues.sort((a, b) => a.department.localeCompare(b.department));

    res.status(200).json({
      success: true,
      data: {
        departments: departmentQueues,
        timestamp: new Date().toISOString(),
        totalDepartments: departmentQueues.length,
      },
    });

  } catch (error) {
    console.error('Get queue display error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch queue display',
    });
  }
};

// Search for specific queue status by queue number
const searchQueueStatus = async (req, res) => {
  try {
    const { queueNumber } = req.params;

    if (!queueNumber) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Queue number is required',
      });
    }

    // Find the queue by queue number
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
        message: 'Queue number not found',
      });
    }

    // Calculate position in queue if waiting
    let positionInQueue = null;
    let estimatedWaitTime = null;

    if (queue.status === 'Waiting') {
      // Count patients ahead in the same department and service type
      positionInQueue = await db.Queue.count({
        where: {
          department: queue.department,
          serviceType: queue.serviceType,
          status: 'Waiting',
          joinedAt: {
            [Sequelize.Op.lt]: queue.joinedAt,
          },
        },
      });

      positionInQueue += 1; // +1 because count starts from 0

      // Calculate estimated wait time based on position
      const avgServiceTime = await getAverageServiceTime(queue.department, queue.serviceType);
      estimatedWaitTime = positionInQueue * avgServiceTime;
    }

    // Get department status for context
    const departmentStatus = await getDepartmentStatus(queue.department);

    res.status(200).json({
      success: true,
      data: {
        queue: {
          queueNumber: queue.queueNumber,
          status: queue.status,
          serviceType: queue.serviceType,
          department: queue.department,
          priority: queue.priority,
          joinedAt: queue.joinedAt,
          serviceStartTime: queue.serviceStartTime,
          serviceEndTime: queue.serviceEndTime,
          estimatedWaitTime: queue.estimatedWaitTime,
          actualWaitTime: queue.actualWaitTime,
          notes: queue.notes,
        },
        patient: {
          name: `${queue.patient.user.firstName} ${queue.patient.user.lastName}`,
          phoneNumber: queue.patient.user.phoneNumber,
        },
        doctor: queue.doctor ? {
          name: `${queue.doctor.firstName} ${queue.doctor.lastName}`,
        } : null,
        positionInQueue,
        estimatedWaitTime,
        departmentStatus,
        lastUpdated: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Search queue status error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search queue status',
    });
  }
};

// Search by patient phone number (alternative search method)
const searchByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.query;

    if (!phoneNumber) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone number is required',
      });
    }

    // Validate Ethiopian phone format
    if (!/^\+251[9][0-9]{8}$/.test(phoneNumber)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Phone number must be in Ethiopian format (+2519xxxxxxxx)',
      });
    }

    // Find user by phone number
    const user = await db.User.findOne({
      where: { phoneNumber },
      include: [
        {
          model: db.Patient,
          as: 'patientProfile',
        },
      ],
    });

    if (!user || !user.patientProfile) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No patient found with this phone number',
      });
    }

    // Get all queues for this patient
    const queues = await db.Queue.findAll({
      where: { patientId: user.patientProfile.id },
      include: [
        {
          model: db.User,
          as: 'doctor',
          attributes: ['firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 10, // Last 10 queues
    });

    const activeQueues = queues.filter(q => ['Waiting', 'InProgress'].includes(q.status));
    const completedQueues = queues.filter(q => q.status === 'Complete');

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: `${user.firstName} ${user.lastName}`,
          phoneNumber: user.phoneNumber,
        },
        activeQueues: activeQueues.map(queue => ({
          queueNumber: queue.queueNumber,
          status: queue.status,
          serviceType: queue.serviceType,
          department: queue.department,
          joinedAt: queue.joinedAt,
          estimatedWaitTime: queue.estimatedWaitTime,
        })),
        completedQueues: completedQueues.map(queue => ({
          queueNumber: queue.queueNumber,
          serviceType: queue.serviceType,
          department: queue.department,
          completedAt: queue.serviceEndTime,
          actualWaitTime: queue.actualWaitTime,
        })),
        totalQueues: queues.length,
      },
    });

  } catch (error) {
    console.error('Search by phone number error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to search by phone number',
    });
  }
};

// Helper functions
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
        [Sequelize.fn('AVG', Sequelize.col('actualWaitTime')), 'avgWaitTime'],
      ],
      raw: true,
    });

    return result[0]?.avgWaitTime ? Math.round(result[0].avgWaitTime) : 15; // Default 15 minutes
  } catch (error) {
    console.error('Error calculating average wait time:', error);
    return 15;
  }
};

const calculateEstimatedWaitTime = (queue, waitingCount) => {
  const avgServiceTime = 15; // Default service time in minutes
  const positionInQueue = waitingCount + 1;
  return positionInQueue * avgServiceTime;
};

const getAverageServiceTime = async (department, serviceType) => {
  try {
    const result = await db.Queue.findAll({
      where: {
        department: department,
        serviceType: serviceType,
        status: 'Complete',
        actualWaitTime: {
          [Sequelize.Op.not]: null,
        },
      },
      attributes: [
        [Sequelize.fn('AVG', Sequelize.col('actualWaitTime')), 'avgServiceTime'],
      ],
      raw: true,
    });

    return result[0]?.avgServiceTime ? Math.round(result[0].avgServiceTime) : 15;
  } catch (error) {
    console.error('Error getting average service time:', error);
    return 15;
  }
};

const getDepartmentStatus = async (department) => {
  try {
    const stats = await db.Queue.findAll({
      where: {
        department: department,
        status: ['Waiting', 'InProgress'],
      },
      attributes: [
        'status',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['status'],
      raw: true,
    });

    const waitingCount = stats.find(s => s.status === 'Waiting')?.count || 0;
    const inProgressCount = stats.find(s => s.status === 'InProgress')?.count || 0;

    return {
      waitingCount,
      inProgressCount,
      totalActive: waitingCount + inProgressCount,
    };
  } catch (error) {
    console.error('Error getting department status:', error);
    return {
      waitingCount: 0,
      inProgressCount: 0,
      totalActive: 0,
    };
  }
};

export { getQueueDisplay, searchQueueStatus, searchByPhoneNumber };
