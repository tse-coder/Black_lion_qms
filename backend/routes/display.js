import express from 'express';
import { getQueueDisplay, searchQueueStatus, searchByPhoneNumber } from '../controllers/displayController.js';
import Joi from 'joi';

const router = express.Router();

// Public endpoints - no authentication required

// GET /api/queue/display - Public queue display for all departments
router.get('/queue/display', getQueueDisplay);

// GET /api/queue/search/:queueNumber - Search queue by queue number
router.get('/queue/search/:queueNumber', searchQueueStatus);

// GET /api/queue/search-by-phone - Search by phone number
router.get('/queue/search-by-phone', searchByPhoneNumber);

// Validation middleware for phone number search
const validatePhoneSearch = (req, res, next) => {
  const { phoneNumber } = req.query;
  
  if (!phoneNumber) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Phone number is required',
    });
  }

  if (!/^\+251[9][0-9]{8}$/.test(phoneNumber)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Phone number must be in Ethiopian format (+2519xxxxxxxx)',
    });
  }

  next();
};

// Apply validation to phone search endpoint
router.get('/queue/search-by-phone', validatePhoneSearch, searchByPhoneNumber);

export default router;
