import request from 'supertest';
import sequelize from '../../config/database.js';
import db from '../../models/index.js';

describe('Real Application Integration Tests', () => {
  let app;
  let doctorToken;
  let patientToken;
  let adminToken;

  beforeAll(async () => {
    // Import the real app
    const appModule = await import('../../index.js');
    
    // Create a test version that doesn't start the server
    const express = await import('express');
    const cors = await import('cors');
    const helmet = await import('helmet');
    const rateLimit = await import('express-rate-limit');
    const { config } = await import('dotenv');

    config({ path: '.env.test' });

    app = express.default();
    app.use(helmet.default());
    app.use(cors.default());
    app.use(express.default.json());
    app.use(express.default.urlencoded({ extended: true }));

    // Import and use the real routes
    const authRoutes = (await import('../../routes/auth.js')).default;
    const queueRoutes = (await import('../../routes/queues.js')).default;
    const displayRoutes = (await import('../../routes/display.js')).default;

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/queues', queueRoutes);
    app.use('/api/v1/api', displayRoutes);

    // Health check
    app.get('/api/v1/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Test API is running',
      });
    });

    // Error handling
    app.use((err, req, res, next) => {
      console.error(err);
      res.status(500).json({ error: err.message });
    });
  });

  beforeAll(async () => {
    // Sync database
    await sequelize.sync({ force: true });

    // Create test users
    const adminUser = await db.User.create({
      username: 'admin_test',
      email: 'admin@test.com',
      password: 'password123', // Will be hashed by hook
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+251911111111',
    });

    const doctorUser = await db.User.create({
      username: 'doctor_test',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'Doctor',
      firstName: 'Doctor',
      lastName: 'Test',
      phoneNumber: '+251912222222',
    });

    const patientUser = await db.User.create({
      username: 'patient_test',
      email: 'patient@test.com',
      password: 'password123',
      role: 'Patient',
      firstName: 'Patient',
      lastName: 'Test',
      phoneNumber: '+251913333333',
    });

    // Create patient profile
    await db.Patient.create({
      userId: patientUser.id,
      cardNumber: 'TEST-001',
      medicalRecordNumber: 'MRN-TEST-001',
      dateOfBirth: '1990-01-01',
      gender: 'Male',
      bloodType: 'O+',
    });

    // Login and get tokens
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    const doctorLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'doctor@test.com',
        password: 'password123',
      });

    const patientLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'patient@test.com',
        password: 'password123',
      });

    adminToken = adminLogin.body.data.token;
    doctorToken = doctorLogin.body.data.token;
    patientToken = patientLogin.body.data.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Authentication Flow', () => {
    test('Health check should work', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });

    test('Admin login should work', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('Admin');
      expect(response.body.data.token).toBeDefined();
    });

    test('Invalid login should fail', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Queue Management Flow', () => {
    test('Queue request should work with valid card', async () => {
      // Mock the EMR service by temporarily overriding it
      const originalEmrService = (await import('../../services/emrService.js')).default;
      
      // Override validatePatientCard method
      originalEmrService.validatePatientCard = async (cardNumber) => {
        if (cardNumber === 'TEST-001') {
          return {
            success: true,
            data: {
              id: 'patient-uuid-001',
              cardNumber: 'TEST-001',
              medicalRecordNumber: 'MRN-TEST-001',
              firstName: 'Patient',
              lastName: 'Test',
              dateOfBirth: '1990-01-01',
              gender: 'Male',
              phoneNumber: '+251913333333',
              bloodType: 'O+',
              allergies: 'None',
              chronicConditions: 'None',
              isActive: true,
            },
            message: 'Patient card validated successfully',
          };
        }
        return {
          success: false,
          error: 'PATIENT_NOT_FOUND',
          message: 'Invalid patient card number',
        };
      };

      const response = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Cardiology',
          serviceType: 'General Consultation',
          priority: 'Medium',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.queue.queueNumber).toBeDefined();
      expect(response.body.data.queue.status).toBe('Waiting');
      expect(response.body.data.queue.department).toBe('Cardiology');
    });

    test('Queue status check should work', async () => {
      // First create a queue
      const queueResponse = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Laboratory',
          serviceType: 'Laboratory',
          priority: 'Low',
        });

      const queueNumber = queueResponse.body.data.queue.queueNumber;

      // Check status
      const response = await request(app)
        .get(`/api/v1/queues/status/${queueNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.queue.queueNumber).toBe(queueNumber);
      expect(response.body.data.queue.status).toBe('Waiting');
    });

    test('Public queue display should work', async () => {
      const response = await request(app)
        .get('/api/v1/api/queue/display');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.departments).toBeInstanceOf(Array);
      expect(response.body.data.timestamp).toBeDefined();
    });
  });

  describe('Complete Integration Flow', () => {
    test('End-to-end flow should work', async () => {
      // 1. Patient requests queue
      const queueResponse = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Emergency',
          serviceType: 'Emergency',
          priority: 'High',
        });

      expect(queueResponse.status).toBe(201);
      expect(queueResponse.body.success).toBe(true);
      const queueNumber = queueResponse.body.data.queue.queueNumber;

      // 2. Check queue status
      const statusResponse = await request(app)
        .get(`/api/v1/queues/status/${queueNumber}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.queue.status).toBe('Waiting');

      // 3. Get public display
      const displayResponse = await request(app)
        .get('/api/v1/api/queue/display');

      expect(displayResponse.status).toBe(200);
      expect(displayResponse.body.success).toBe(true);

      // 4. Get all queues
      const queuesResponse = await request(app)
        .get('/api/v1/queues');

      expect(queuesResponse.status).toBe(200);
      expect(queuesResponse.body.success).toBe(true);
      expect(queuesResponse.body.data.queues).toBeInstanceOf(Array);

      // 5. Verify our queue is in the list
      const ourQueue = queuesResponse.body.data.queues.find(q => q.queueNumber === queueNumber);
      expect(ourQueue).toBeDefined();
      expect(ourQueue.status).toBe('Waiting');
      expect(ourQueue.department).toBe('Emergency');
    });
  });

  describe('Error Handling', () => {
    test('Invalid queue number should return 404', async () => {
      const response = await request(app)
        .get('/api/v1/queues/status/INVALID-001');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('Invalid card number should return 404', async () => {
      const response = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'INVALID-001',
          department: 'Cardiology',
          serviceType: 'General Consultation',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('Missing required fields should return 400', async () => {
      const response = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          // Missing department and serviceType
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
