import db from '../models/index.js';

/**
 * Get system activity logs
 */
export const getActivityLogs = async (req, res) => {
    try {
        const { limit = 50, offset = 0, type, action } = req.query;

        const where = {};
        if (type) where.type = type;
        if (action) where.action = action;

        const activities = await db.ActivityLog.findAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'username', 'role']
            }]
        });

        res.status(200).json({
            success: true,
            data: {
                activities
            }
        });
    } catch (error) {
        console.error('[ADMIN] Failed to fetch activity logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activity logs'
        });
    }
};
