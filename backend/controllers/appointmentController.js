import db from '../models/index.js';
import { Sequelize } from 'sequelize';

const createAppointment = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, department, appointmentDate, appointmentTime, notes } = req.body;

        if (!fullName || !phoneNumber || !department || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Full name, phone number, department, date, and time are required',
            });
        }

        // Check if patient already exists by phone number
        let patient = await db.Patient.findOne({
            include: [{
                model: db.User,
                as: 'user',
                where: { phoneNumber }
            }]
        });

        let cardNumber;
        if (patient) {
            cardNumber = patient.cardNumber;
        } else {
            // Robust unique card number generation
            let isUnique = false;
            const patientCount = await db.Patient.count();
            const appointmentCount = await db.Appointment.count();
            let nextNum = patientCount + appointmentCount + 6;

            while (!isUnique) {
                cardNumber = `CARD-${String(nextNum).padStart(3, '0')}`;

                // Check if card number exists in either table
                const existingPatient = await db.Patient.findOne({ where: { cardNumber } });
                const existingAppointment = await db.Appointment.findOne({ where: { cardNumber } });

                if (!existingPatient && !existingAppointment) {
                    isUnique = true;
                } else {
                    nextNum++;
                }
            }
        }

        const appointment = await db.Appointment.create({
            patientId: patient ? patient.id : null,
            fullName,
            email,
            phoneNumber,
            cardNumber,
            department,
            appointmentDate,
            appointmentTime,
            notes,
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully',
            data: {
                appointment,
                cardNumber, // Return the card number so the user can use it for check-in
            },
        });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create appointment',
        });
    }
};

const getAppointments = async (req, res) => {
    try {
        const appointments = await db.Appointment.findAll({
            order: [['appointmentDate', 'ASC'], ['appointmentTime', 'ASC']],
        });

        res.status(200).json({
            success: true,
            data: appointments,
        });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch appointments',
        });
    }
};

export { createAppointment, getAppointments };
