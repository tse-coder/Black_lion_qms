import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Appointment = sequelize.define('Appointment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    patientId: {
        type: DataTypes.UUID,
        allowNull: true, // Can be null if patient is not registered yet
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true,
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^\+251[9][0-9]{8}$/,
        },
    },
    cardNumber: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    appointmentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    appointmentTime: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
        defaultValue: 'Scheduled',
    },
    notes: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

export default Appointment;
