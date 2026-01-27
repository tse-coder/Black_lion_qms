import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., 'SMS', 'PUSH', 'EMAIL'
        defaultValue: 'SMS',
    },
    recipient: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'sent', // e.g., 'sent', 'delivered', 'failed'
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    sentAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}, {
    timestamps: true,
    updatedAt: false,
});

export default Notification;
