import request from 'supertest';
import sequelize from '../../config/database.js';
import db from '../../models/index.js';

describe('Simple Integration Tests', () => {
  let app;
  let doctorToken;
  let patientToken;
  let adminToken;

  beforeAll(async () => {
    // Create a simple Express app for testing
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

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        message: 'Test API is running',
      });
    });

    // Simple auth endpoint for testing
    app.post('/auth/login', async (req, res) => {
      try {
        const { email, password } = req.body;
        
        // Create test user if doesn't exist
        let user = await db.User.findOne({ where: { email } });
        if (!user) {
          user = await db.User.create({
            username: email.split('@')[0],
            email,
            password: 'hashed_password', // Skip hashing for test
            role: email.includes('admin') ? 'Admin' : email.includes('doctor') ? 'Doctor' : 'Patient',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '+251912345678',
          });
        }

        // Generate simple token (not real JWT for testing)
        const token = `test_token_${user.id}`;
        
        res.status(200).json({
          success: true,
          data: {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            token,
          },
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Protected endpoint
    app.get('/protected', (req, res) => {
      const authHeader = req.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      res.status(200).json({ message: 'Access granted' });
    });

    // Queue request endpoint
    app.post('/queues/request', async (req, res) => {
      try {
        const { cardNumber, department, serviceType } = req.body;
        
        // Create test patient if doesn't exist
        let patient = await db.Patient.findOne({ where: { cardNumber } });
        if (!patient) {
          const user = await db.User.create({
            username: `patient_${cardNumber}`,
            email: `${cardNumber}@test.com`,
            password: 'hashed_password',
            role: 'Patient',
            firstName: 'Test',
            lastName: 'Patient',
            phoneNumber: '+251912345678',
          });

          patient = await db.Patient.create({
            userId: user.id,
            cardNumber,
            medicalRecordNumber: `MRN-${cardNumber}`,
            dateOfBirth: '1990-01-01',
            gender: 'Male',
            bloodType: 'O+',
          });
        }

        // Create queue
        const queue = await db.Queue.create({
          queueNumber: `${department.substring(0, 3).toUpperCase()}-001`,
          patientId: patient.id,
          serviceType,
          department,
          status: 'Waiting',
          joinedAt: new Date(),
        });

        res.status(201).json({
          success: true,
          data: { queue },
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get queues endpoint
    app.get('/queues', async (req, res) => {
      try {
        const queues = await db.Queue.findAll({
          include: [
            {
              model: db.Patient,
              as: 'patient',
              include: [
                {
                  model: db.User,
                  as: 'user',
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
          ],
        });

        res.status(200).json({
          success: true,
          data: { queues },
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
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

    // Get tokens
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    const doctorLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'doctor@test.com',
        password: 'password123',
      });

    const patientLogin = await request(app)
      .post('/auth/login')
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

  test('Health check should work', async () => {
    const response = await request(app)
      .get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('Login should work', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('Protected endpoint should require token', async () => {
    const response = await request(app)
      .get('/protected');

    expect(response.status).toBe(401);
  });

  test('Protected endpoint should work with token', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Access granted');
  });

  test('Queue request should work', async () => {
    const response = await request(app)
      .post('/queues/request')
      .send({
        cardNumber: 'TEST-001',
        department: 'Cardiology',
        serviceType: 'General Consultation',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.queue.queueNumber).toBeDefined();
    expect(response.body.data.queue.status).toBe('Waiting');
  });

  test('Get queues should work', async () => {
    // First create a queue
    await request(app)
      .post('/queues/request')
      .send({
        cardNumber: 'TEST-002',
        department: 'Laboratory',
        serviceType: 'Laboratory',
      });

    const response = await request(app)
      .get('/queues');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.queues).toBeInstanceOf(Array);
    expect(response.body.data.queues.length).toBeGreaterThan(0);
  });

  test('Complete flow: Login -> Request Queue -> Get Queues', async () => {
    // 1. Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'flow@test.com',
        password: 'password123',
      });

    expect(loginResponse.status).toBe(200);
    const token = loginResponse.body.data.token;

    // 2. Request queue
    const queueResponse = await request(app)
      .post('/queues/request')
      .send({
        cardNumber: 'FLOW-001',
        department: 'Emergency',
        serviceType: 'Emergency',
      });

    expect(queueResponse.status).toBe(201);
    const queueNumber = queueResponse.body.data.queue.queueNumber;

    // 3. Get queues and verify our queue is there
    const queuesResponse = await request(app)
      .get('/queues');

    expect(queuesResponse.status).toBe(200);
    const queues = queuesResponse.body.data.queues;
    const ourQueue = queues.find(q => q.queueNumber === queueNumber);
    
    expect(ourQueue).toBeDefined();
    expect(ourQueue.status).toBe('Waiting');
    expect(ourQueue.department).toBe('Emergency');
    expect(ourQueue.patient.user.firstName).toBe('Test');
  });
});
