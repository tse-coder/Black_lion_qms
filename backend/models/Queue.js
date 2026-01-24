import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Queue = sequelize.define('Queue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  queueNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  patientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  serviceType: {
    type: DataTypes.ENUM('General Consultation', 'Specialist', 'Laboratory', 'Radiology', 'Pharmacy', 'Emergency'),
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  status: {
    type: DataTypes.ENUM('Waiting', 'InProgress', 'Complete', 'Cancelled'),
    allowNull: false,
    defaultValue: 'Waiting',
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    allowNull: false,
    defaultValue: 'Medium',
  },
  estimatedWaitTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  actualWaitTime: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true,
  },
  serviceStartTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  serviceEndTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  joinedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['queueNumber'],
    },
    {
      fields: ['status'],
    },
    {
      fields: ['department'],
    },
    {
      fields: ['serviceType'],
    },
    {
      fields: ['patientId'],
    },
    {
      fields: ['doctorId'],
    },
  ],
});

export default Queue;
