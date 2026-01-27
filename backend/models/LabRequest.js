import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LabRequest = sequelize.define('LabRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  queueId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Queues',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  labTechId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  patientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'In Progress', 'Complete', 'Rejected'),
    allowNull: false,
    defaultValue: 'Pending',
  },
  testResults: {
    type: DataTypes.TEXT,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  requestedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  startedAt: {
    type: DataTypes.DATE,
  },
  completedAt: {
    type: DataTypes.DATE,
  },
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['doctorId'],
    },
    {
      fields: ['labTechId'],
    },
    {
      fields: ['cardNumber'],
    },
    {
      fields: ['department'],
    },
    {
      fields: ['requestedAt'],
    },
  ],
});

export default LabRequest;
