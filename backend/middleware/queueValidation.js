import Joi from 'joi';

// Queue request validation schema
const queueRequestSchema = Joi.object({
  cardNumber: Joi.string().required().messages({
    'any.required': 'Card number is required',
    'string.empty': 'Card number cannot be empty',
  }),
  department: Joi.string().valid(
    'Cardiology',
    'Family Medicine',
    'Pediatrics',
    'Gynecology',
    'Emergency',
    'General Surgery',
    'Orthopedics',
    'Neurology',
    'Internal Medicine'
  ).required().messages({
    'any.only': 'Department must be one of: Cardiology, Family Medicine, Pediatrics, Gynecology, Emergency, General Surgery, Orthopedics, Neurology, Internal Medicine',
    'any.required': 'Department is required',
  }),
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent').default('Medium').messages({
    'any.only': 'Priority must be one of: Low, Medium, High, Urgent',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
});

// Queue status update validation schema
const queueStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('Waiting', 'InProgress', 'Complete', 'Cancelled').required().messages({
    'any.only': 'Status must be one of: Waiting, InProgress, Complete, Cancelled',
    'any.required': 'Status is required',
  }),
  notes: Joi.string().max(500).optional().messages({
    'string.max': 'Notes must not exceed 500 characters',
  }),
});

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
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

export { queueRequestSchema, queueStatusUpdateSchema, validate };
