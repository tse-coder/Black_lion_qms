import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  medicalRecordNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
  },
  emergencyContactName: {
    type: DataTypes.STRING,
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+251[9][0-9]{8}$/,
    },
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
  },
  allergies: {
    type: DataTypes.TEXT,
  },
  chronicConditions: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cardNumber'],
    },
    {
      unique: true,
      fields: ['medicalRecordNumber'],
    },
  ],
});

export default Patient;
