import request from 'supertest';
import sequelize from '../../config/database.js';
import db from '../../models/index.js';

describe('Queue Management Integration Tests', () => {
  let app;
  let doctorToken;
  let patientToken;
  let adminToken;
  let doctorUser;
  let patientUser;
  let adminUser;
  let createdQueue;

  beforeAll(async () => {
    // Import the app after database is ready
    const appModule = await import('../../index.js');
    app = appModule.default;

    // Sync database
    await sequelize.sync({ force: true });

    // Create test users
    adminUser = await db.User.create({
      username: 'admin_test',
      email: 'admin@test.com',
      password: 'password123',
      role: 'Admin',
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+251911111111',
    });

    doctorUser = await db.User.create({
      username: 'doctor_test',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'Doctor',
      firstName: 'Doctor',
      lastName: 'Test',
      phoneNumber: '+251912222222',
    });

    patientUser = await db.User.create({
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
    // Clean up database
    await sequelize.close();
  });

  describe('1. User Authentication', () => {
    test('Admin should login successfully', async () => {
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

    test('Doctor should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'doctor@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('Doctor');
      expect(response.body.data.token).toBeDefined();
    });

    test('Patient should login successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'patient@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('Patient');
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

  describe('2. Queue Request Flow', () => {
    test('Patient should request queue number successfully', async () => {
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
      expect(response.body.data.smsSent).toBe(true);

      createdQueue = response.body.data.queue;
    });

    test('Duplicate queue request should fail', async () => {
      const response = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Cardiology',
          serviceType: 'General Consultation',
          priority: 'Medium',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Duplicate Queue Entry');
    });

    test('Invalid card number should fail', async () => {
      const response = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'INVALID-001',
          department: 'Cardiology',
          serviceType: 'General Consultation',
          priority: 'Medium',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('3. Queue Status Check', () => {
    test('Public should check queue status by number', async () => {
      const response = await request(app)
        .get(`/api/v1/queues/status/${createdQueue.queueNumber}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.queue.queueNumber).toBe(createdQueue.queueNumber);
      expect(response.body.data.queue.status).toBe('Waiting');
      expect(response.body.data.position).toBeDefined();
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

  describe('4. Doctor Queue Management', () => {
    test('Doctor should get active queues', async () => {
      const response = await request(app)
        .get('/api/v1/api/queue/active')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ department: 'Cardiology' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.waitingPatients).toBeInstanceOf(Array);
    });

    test('Doctor should call next patient', async () => {
      const response = await request(app)
        .patch('/api/v1/api/queue/call-next')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          department: 'Cardiology',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.calledPatient.status).toBe('InProgress');
      expect(response.body.data.smsSent).toBe(true);

      // Update createdQueue with the called patient data
      createdQueue = response.body.data.calledPatient;
    });

    test('Doctor should not be able to call another patient while one is in progress', async () => {
      // Create another queue
      await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Cardiology',
          serviceType: 'Specialist',
          priority: 'Medium',
        });

      const response = await request(app)
        .patch('/api/v1/api/queue/call-next')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          department: 'Cardiology',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Conflict');
    });
  });

  describe('5. Complete Consultation', () => {
    test('Doctor should complete patient consultation', async () => {
      const response = await request(app)
        .patch('/api/v1/api/queue/complete')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          notes: 'Consultation completed successfully',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.completedPatient.status).toBe('Complete');
      expect(response.body.data.actualServiceTime).toBeDefined();
      expect(response.body.data.smsSent).toBe(true);
    });

    test('Doctor should get queue statistics', async () => {
      const response = await request(app)
        .get('/api/v1/api/queue/statistics')
        .set('Authorization', `Bearer ${doctorToken}`)
        .query({ department: 'Cardiology', dateRange: 'today' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.statistics).toBeInstanceOf(Array);
      expect(response.body.data.totalServed).toBeDefined();
    });
  });

  describe('6. Role-based Access Control', () => {
    test('Patient should not access doctor endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/api/queue/active')
        .set('Authorization', `Bearer ${patientToken}`)
        .query({ department: 'Cardiology' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    test('Unauthenticated user should not access protected endpoints', async () => {
      const response = await request(app)
        .get('/api/v1/api/queue/active')
        .query({ department: 'Cardiology' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Admin should access user management', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
    });
  });

  describe('7. Complete Flow Integration', () => {
    test('End-to-end queue flow should work', async () => {
      // 1. Patient requests new queue
      const queueResponse = await request(app)
        .post('/api/v1/queues/request')
        .send({
          cardNumber: 'TEST-001',
          department: 'Laboratory',
          serviceType: 'Laboratory',
          priority: 'Low',
        });

      expect(queueResponse.status).toBe(201);
      const newQueue = queueResponse.body.data.queue;

      // 2. Check queue status
      const statusResponse = await request(app)
        .get(`/api/v1/queues/status/${newQueue.queueNumber}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.data.queue.status).toBe('Waiting');

      // 3. Doctor calls patient
      const callResponse = await request(app)
        .patch('/api/v1/api/queue/call-next')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          department: 'Laboratory',
        });

      expect(callResponse.status).toBe(200);
      expect(callResponse.body.data.calledPatient.status).toBe('InProgress');

      // 4. Doctor completes consultation
      const completeResponse = await request(app)
        .patch('/api/v1/api/queue/complete')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          notes: 'Lab tests completed',
        });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.data.completedPatient.status).toBe('Complete');

      // 5. Verify final status
      const finalStatusResponse = await request(app)
        .get(`/api/v1/queues/status/${newQueue.queueNumber}`);

      expect(finalStatusResponse.status).toBe(200);
      expect(finalStatusResponse.body.data.queue.status).toBe('Complete');
    });
  });

  describe('8. Health Check', () => {
    test('Health check should return OK status', async () => {
      const response = await request(app)
        .get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.message).toContain('Black Lion Hospital DQMS');
    });
  });
});
