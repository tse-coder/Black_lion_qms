import db from '../models/index.js';
import { validate, userRegistrationSchema } from '../middleware/validation.js';
import bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize';

// User Registration
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      phoneNumber
    } = req.body;

    // Check if user already exists
    const existingUser = await db.User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email or username already exists',
      });
    }

    // Create user (password will be hashed by User model hook)
    const user = await db.User.create({
      username,
      email,
      password, // Plain password - User model will hash it
      role,
      firstName,
      lastName,
      phoneNumber,
      isActive: true,
    });

    // Remove password from response
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed. Please try again.',
    });
  }
};

// Create Patient Profile (for patients who already have user accounts)
const createPatientProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      cardNumber,
      medicalRecordNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      allergies,
      chronicConditions
    } = req.body;

    // Check if patient profile already exists
    const existingProfile = await db.Patient.findOne({
      where: { userId }
    });

    if (existingProfile) {
      return res.status(409).json({
        error: 'Profile Already Exists',
        message: 'Patient profile already exists for this user',
      });
    }

    // Create patient profile
    const patient = await db.Patient.create({
      userId,
      cardNumber,
      medicalRecordNumber,
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      allergies,
      chronicConditions,
    });

    res.status(201).json({
      success: true,
      message: 'Patient profile created successfully',
      data: {
        patient: {
          id: patient.id,
          cardNumber: patient.cardNumber,
          medicalRecordNumber: patient.medicalRecordNumber,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          bloodType: patient.bloodType,
        },
      },
    });

  } catch (error) {
    console.error('Create patient profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create patient profile',
    });
  }
};

export { register, createPatientProfile };
