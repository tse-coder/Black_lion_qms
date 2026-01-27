import db from '../models/index.js';
import { logActivity } from '../utils/activityLogger.js';
import { validate, userRegistrationSchema } from '../middleware/validation.js';
import bcrypt from 'bcrypt';
import { Sequelize } from 'sequelize';

// User Registration (Unified for Patient)
const register = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      role = 'Patient',
      // Patient specific fields
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

    // Check if user already exists
    const existingUser = await db.User.findOne({
      where: {
        [Sequelize.Op.or]: [
          { email },
          { username }
        ]
      },
      transaction
    });

    if (existingUser) {
      await transaction.rollback();
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'A user with this email or username already exists',
      });
    }

    // Create user
    const user = await db.User.create({
      username,
      email,
      password, // Plain password - User model hook will hash it
      role,
      firstName,
      lastName,
      phoneNumber,
      isActive: true,
    }, { transaction });

    // If role is Patient, create patient profile
    if (role === 'Patient') {
      await db.Patient.create({
        userId: user.id,
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
      }, { transaction });
    }

    await transaction.commit();

    // Log the registration
    await logActivity({
      userId: user.id,
      type: 'USER',
      action: 'REGISTER',
      description: `New ${role} registered: ${firstName} ${lastName}`,
      req
    });

    // Fetch user with patient profile to return
    const createdUser = await db.User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: role === 'Patient' ? [{ model: db.Patient, as: 'patientProfile' }] : []
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: createdUser,
      },
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Registration failed. Please try again.',
    });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      // Patient fields
      address,
      emergencyContactName,
      emergencyContactPhone,
      bloodType,
      allergies,
      chronicConditions
    } = req.body;

    const user = await db.User.findByPk(userId, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ error: 'User not found' });
    }

    // Update User fields
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
    }, { transaction });

    // Update Patient fields if it's a patient
    if (user.role === 'Patient') {
      const patient = await db.Patient.findOne({ where: { userId }, transaction });
      if (patient) {
        await patient.update({
          address: address !== undefined ? address : patient.address,
          emergencyContactName: emergencyContactName !== undefined ? emergencyContactName : patient.emergencyContactName,
          emergencyContactPhone: emergencyContactPhone !== undefined ? emergencyContactPhone : patient.emergencyContactPhone,
          bloodType: bloodType !== undefined ? bloodType : patient.bloodType,
          allergies: allergies !== undefined ? allergies : patient.allergies,
          chronicConditions: chronicConditions !== undefined ? chronicConditions : patient.chronicConditions,
        }, { transaction });
      }
    }

    await transaction.commit();

    // Log the update
    await logActivity({
      userId: user.id,
      type: 'USER',
      action: 'UPDATE_PROFILE',
      description: `${user.firstName} updated their profile`,
      req
    });

    const updatedUser = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: user.role === 'Patient' ? [{ model: db.Patient, as: 'patientProfile' }] : []
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to update profile',
    });
  }
};

// Change Password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.validatePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Current password is incorrect',
      });
    }

    // Update password (hook will hash it)
    user.password = newPassword;
    await user.save();

    // Log the change
    await logActivity({
      userId: user.id,
      type: 'USER',
      action: 'CHANGE_PASSWORD',
      description: `${user.firstName} changed their password`,
      req
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to change password',
    });
  }
};

export { register, updateProfile, changePassword };
