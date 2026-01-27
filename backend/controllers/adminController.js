import db from '../models/index.js';
import { Sequelize } from 'sequelize';

// Get system-wide statistics for Admin Dashboard
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await db.User.count();
        const activeUsers = await db.User.count({ where: { isActive: true } });

        // Total queues created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const totalQueuesToday = await db.Queue.count({
            where: {
                createdAt: { [Sequelize.Op.gte]: startOfDay }
            }
        });

        const activeQueues = await db.Queue.count({
            where: {
                status: ['Waiting', 'InProgress']
            }
        });

        // Count departments
        const departments = await db.Queue.count({
            distinct: true,
            col: 'department'
        });

        // Department-wise breakdown
        const deptBreakdown = await db.Queue.findAll({
            where: {
                status: ['Waiting', 'InProgress', 'Complete']
            },
            attributes: [
                'department',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
                [Sequelize.literal(`COUNT(CASE WHEN status = 'Waiting' THEN 1 END)`), 'waiting'],
                [Sequelize.literal(`COUNT(CASE WHEN status = 'InProgress' THEN 1 END)`), 'inProgress'],
                [Sequelize.literal(`COUNT(CASE WHEN status = 'Complete' THEN 1 END)`), 'completed']
            ],
            group: ['department']
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                totalQueues: totalQueuesToday,
                activeQueues,
                departments: departments || 8, // Fallback to 8 if none yet
                todayVisits: totalQueuesToday,
                departmentStats: deptBreakdown
            }
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch system statistics'
        });
    }
};

// Admin User Creation (can set any role)
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, firstName, lastName, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: {
                [Sequelize.Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'User Already Exists',
                message: 'A user with this email or username already exists'
            });
        }

        const user = await db.User.create({
            username,
            email,
            password,
            role,
            firstName,
            lastName,
            phoneNumber,
            isActive: true
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create user'
        });
    }
};

export { getSystemStats, createUser };
