import sequelize from '../config/database.js';
import User from './User.js';
import Patient from './Patient.js';
import Queue from './Queue.js';
import Appointment from './Appointment.js';
import ActivityLog from './ActivityLog.js';
import LabRequest from './LabRequest.js';

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

// Lab Request Associations
LabRequest.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Patient.hasMany(LabRequest, { foreignKey: 'patientId', as: 'labRequests' });

LabRequest.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
User.hasMany(LabRequest, { foreignKey: 'doctorId', as: 'doctorLabRequests' });

// Associate LabRequest with Queue to track which visit it belongs to
LabRequest.belongsTo(Queue, { foreignKey: 'queueId', as: 'queue' });
Queue.hasMany(LabRequest, { foreignKey: 'queueId', as: 'labRequests' });

User.hasMany(ActivityLog, {
  foreignKey: 'userId',
  as: 'activities',
});

ActivityLog.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Export models and sequelize instance
const db = {
  sequelize,
  User,
  Patient,
  Queue,
  Appointment,
  LabRequest,
  ActivityLog,
};

export default db;
