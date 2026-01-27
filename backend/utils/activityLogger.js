import db from '../models/index.js';

/**
 * Log a system activity and optionally emit a socket event
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID associated with the activity
 * @param {string} params.type - Category (AUTH, QUEUE, USER, NOTIFICATION, etc)
 * @param {string} params.action - Specific action (LOGIN, CHECK_IN, etc)
 * @param {string} params.description - Human readable description
 * @param {Object} [params.metadata] - Additional context data
 * @param {Object} [params.req] - Express request object for IP/User-Agent
 * @param {Object} [params.io] - Socket.io instance for real-time updates
 */
export const logActivity = async ({
    userId,
    type,
    action,
    description,
    metadata = {},
    req = null,
    io = null,
}) => {
    try {
        const logData = {
            userId,
            type,
            action,
            description,
            metadata,
        };

        if (req) {
            logData.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            logData.userAgent = req.headers['user-agent'];
        }

        const log = await db.ActivityLog.create(logData);

        // Fetch the log with user info for the frontend
        const fullLog = await db.ActivityLog.findByPk(log.id, {
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'role']
            }]
        });

        // Emit real-time update if io is provided
        if (io) {
            io.emit('activity:new', fullLog);
        } else if (req && req.app && req.app.get('io')) {
            req.app.get('io').emit('activity:new', fullLog);
        }

        return fullLog;
    } catch (error) {
        console.error('[LOGGER] Failed to log activity:', error);
        // We don't want to crash the main process if logging fails
        return null;
    }
};
