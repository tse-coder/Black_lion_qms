import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import Queue from './Queue.js';
import Appointment from './Appointment.js';
import ActivityLog from './ActivityLog.js';
import Notification from './Notification.js';

// Define associations
User.hasOne(Patient, {
  foreignKey: 'userId',
  as: 'patientProfile',
});

Patient.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

User.hasMany(Queue, {
  foreignKey: 'doctorId',
  as: 'doctorQueues',
});

Patient.hasMany(Queue, {
  foreignKey: 'patientId',
  as: 'queues',
});

Queue.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

Patient.hasMany(Appointment, {
  foreignKey: 'patientId',
  as: 'appointments',
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

Queue.belongsTo(User, {
  foreignKey: 'doctorId',
  as: 'doctor',
});

User.hasMany(ActivityLog, {
  foreignKey: 'userId',
  as: 'activities',
});

ActivityLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

Patient.hasMany(Notification, {
  foreignKey: 'patientId',
  as: 'notifications',
});

Notification.belongsTo(Patient, {
  foreignKey: 'patientId',
  as: 'patient',
});

// Export models and sequelize instance
const db = {
  sequelize,
  User,
  Patient,
  Queue,
  Appointment,
  ActivityLog,
  Notification,
};

export default db;
