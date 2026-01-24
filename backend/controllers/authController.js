import jwt from 'jsonwebtoken';
import db from '../models/index.js';

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// User Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = await db.User.findOne({
      where: { email },
      include: [
        {
          model: db.Patient,
          as: 'patientProfile',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Account is deactivated',
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password',
      });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    // Generate JWT token
    const token = generateToken(user.id, user.role);

    // Prepare user data for response
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      lastLogin: user.lastLogin,
    };

    // Add patient profile if exists
    if (user.patientProfile) {
      userData.patientProfile = {
        id: user.patientProfile.id,
        cardNumber: user.patientProfile.cardNumber,
        medicalRecordNumber: user.patientProfile.medicalRecordNumber,
      };
    }

    // Role-specific responses
    let roleSpecificData = {};
    
    switch (user.role) {
      case 'Patient':
        roleSpecificData = {
          dashboard: '/patient/dashboard',
          permissions: ['view_own_queues', 'join_queue', 'update_profile'],
        };
        break;
      
      case 'Doctor':
        roleSpecificData = {
          dashboard: '/doctor/dashboard',
          permissions: ['manage_patient_queues', 'view_patient_history', 'update_queue_status'],
        };
        break;
      
      case 'Lab Technician':
        roleSpecificData = {
          dashboard: '/lab/dashboard',
          permissions: ['manage_lab_queues', 'update_lab_results', 'view_lab_history'],
        };
        break;
      
      case 'Admin':
        roleSpecificData = {
          dashboard: '/admin/dashboard',
          permissions: ['manage_users', 'manage_queues', 'view_reports', 'system_config'],
        };
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
        ...roleSpecificData,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Login failed. Please try again.',
    });
  }
};

// Get Current User Profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: db.Patient,
          as: 'patientProfile',
          required: false,
        },
      ],
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch user profile',
    });
  }
};

// Logout (Client-side token removal, but we can track it)
const logout = async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success since JWT is stateless
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Logout failed',
    });
  }
};

export { login, getCurrentUser, logout };
