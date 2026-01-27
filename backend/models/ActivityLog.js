import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ActivityLog = sequelize.define('ActivityLog', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true, // System events might not have a user
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'AUTH', 'QUEUE', 'USER', 'NOTIFICATION'
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'LOGIN', 'CHECK_IN', 'STATUS_CHANGE'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userAgent: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    updatedAt: false, // Activity logs are immutable
});

export default ActivityLog;
