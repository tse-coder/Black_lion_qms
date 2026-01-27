import Joi from 'joi';

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

// User registration validation schema
const userRegistrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username must only contain alphanumeric characters',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must not exceed 30 characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('Patient', 'Doctor', 'Lab Technician', 'Admin').required().messages({
    'any.only': 'Role must be one of: Patient, Doctor, Lab Technician, Admin',
    'any.required': 'Role is required',
  }),
  firstName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'First name must be at least 2 characters long',
    'string.max': 'First name must not exceed 50 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Last name must be at least 2 characters long',
    'string.max': 'Last name must not exceed 50 characters',
    'any.required': 'Last name is required',
  }),
  phoneNumber: Joi.string().pattern(/^\+251[9][0-9]{8}$/).required().messages({
    'string.pattern.base': 'Phone number must be in Ethiopian format (+2519xxxxxxxx)',
    'any.required': 'Phone number is required',
  }),
  // Patient fields (required if role is Patient)
  cardNumber: Joi.string().when('role', {
    is: 'Patient',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  medicalRecordNumber: Joi.string().when('role', {
    is: 'Patient',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  dateOfBirth: Joi.date().iso().when('role', {
    is: 'Patient',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  gender: Joi.string().valid('Male', 'Female', 'Other').when('role', {
    is: 'Patient',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  address: Joi.string().allow('', null),
  emergencyContactName: Joi.string().allow('', null),
  emergencyContactPhone: Joi.string().pattern(/^\+251[9][0-9]{8}$/).allow('', null),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').allow('', null),
  allergies: Joi.string().allow('', null),
  chronicConditions: Joi.string().allow('', null),
});

// Profile update validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().pattern(/^\+251[9][0-9]{8}$/).optional(),
  // Patient fields
  address: Joi.string().allow('', null),
  emergencyContactName: Joi.string().allow('', null),
  emergencyContactPhone: Joi.string().pattern(/^\+251[9][0-9]{8}$/).allow('', null),
  bloodType: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').allow('', null),
  allergies: Joi.string().allow('', null),
  chronicConditions: Joi.string().allow('', null),
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
  }),
});

// Queue creation validation schema
const queueSchema = Joi.object({
  patientId: Joi.string().uuid().required().messages({
    'string.uuid': 'Patient ID must be a valid UUID',
    'any.required': 'Patient ID is required',
  }),
  serviceType: Joi.string().valid(
    'General Consultation',
    'Specialist',
    'Laboratory',
    'Radiology',
    'Pharmacy',
    'Emergency'
  ).required().messages({
    'any.only': 'Service type must be one of: General Consultation, Specialist, Laboratory, Radiology, Pharmacy, Emergency',
    'any.required': 'Service type is required',
  }),
  department: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Department name must be at least 2 characters long',
    'string.max': 'Department name must not exceed 100 characters',
    'any.required': 'Department is required',
  }),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').default('Medium').messages({
    'any.only': 'Priority must be one of: Low, Medium, High, Urgent',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    // Check if req.body exists
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request body is missing or invalid. Make sure Content-Type is application/json',
      });
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errorMessages,
      });
    }

    next();
  };
};

export { validate, loginSchema, userRegistrationSchema, queueSchema, updateProfileSchema, changePasswordSchema };
