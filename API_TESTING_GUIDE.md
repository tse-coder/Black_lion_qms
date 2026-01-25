# Black Lion Hospital DQMS - API Testing Guide

## Overview
This comprehensive guide covers testing all functionalities of the Black Lion Hospital Digital Queue Management System (DQMS) backend API using Postman or API Dog.

## Base URL
```
http://localhost:3000/api/v1
```

## Prerequisites
1. Backend server running on port 3000
2. PostgreSQL database connected
3. Environment variables configured (.env file)

## Authentication
Most endpoints require JWT authentication. Login first to get a token, then include it in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Authentication Endpoints

### 1.1 User Registration
**POST** `/auth/register`

**Request Body:**
```json
{
  "username": "dr_john_doe",
  "email": "doctor@blacklion.gov.et",
  "password": "password123",
  "role": "Doctor",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+251911234567"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "dr_john_doe",
      "email": "doctor@blacklion.gov.et",
      "role": "Doctor",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251911234567",
      "isActive": true,
      "createdAt": "2026-01-25T09:00:00.000Z"
    }
  }
}
```

**Error (409):**
```json
{
  "error": "User Already Exists",
  "message": "A user with this email or username already exists"
}
```

### 1.2 Create Patient Profile
**POST** `/auth/create-patient-profile`

**Headers:** `Authorization: Bearer <patient-token>`

**Request Body:**
```json
{
  "cardNumber": "MRN123456",
  "medicalRecordNumber": "MRN123456",
  "dateOfBirth": "1990-01-01",
  "gender": "Male",
  "address": "Addis Ababa, Ethiopia",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactPhone": "+251912345678",
  "bloodType": "O+",
  "allergies": "None",
  "chronicConditions": "None"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Patient profile created successfully",
  "data": {
    "patient": {
      "id": 1,
      "cardNumber": "MRN123456",
      "medicalRecordNumber": "MRN123456",
      "dateOfBirth": "1990-01-01",
      "gender": "Male",
      "bloodType": "O+"
    }
  }
}
```

### 1.3 User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "doctor@blacklion.gov.et",
  "password": "password123"
}
```

**Sample Responses:**

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "doctor_john",
      "email": "doctor@blacklion.gov.et",
      "role": "Doctor",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251911234567",
      "lastLogin": "2026-01-25T09:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "dashboard": "/doctor/dashboard",
    "permissions": ["manage_patient_queues", "view_patient_history", "update_queue_status"]
  }
}
```

**Error (401):**
```json
{
  "error": "Authentication Failed",
  "message": "Invalid email or password"
}
```

### 1.4 Get Current User Profile
**GET** `/auth/current-user`

**Headers:** `Authorization: Bearer <token>`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "doctor_john",
      "email": "doctor@blacklion.gov.et",
      "role": "Doctor",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251911234567",
      "patientProfile": null
    }
  }
}
```

### 1.5 Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Success (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 2. Queue Management Endpoints

### 2.1 Request Queue Number (Patient Check-in)
**POST** `/queues/request`

**Request Body:**
```json
{
  "cardNumber": "MRN123456",
  "department": "Cardiology",
  "serviceType": "Consultation",
  "priority": "Medium"
}
```

**Success (201):**
```json
{
  "success": true,
  "message": "Queue number assigned successfully",
  "data": {
    "queue": {
      "id": 1,
      "queueNumber": "CARD-001",
      "patientId": 1,
      "serviceType": "Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "status": "Waiting",
      "estimatedWaitTime": 15,
      "joinedAt": "2026-01-25T09:00:00.000Z",
      "patient": {
        "user": {
          "firstName": "Abebe",
          "lastName": "Kebede",
          "phoneNumber": "+251911234567"
        }
      }
    },
    "patientInfo": {
      "name": "Abebe Kebede",
      "cardNumber": "MRN123456",
      "medicalRecordNumber": "MRN123456"
    },
    "estimatedWaitTime": 15,
    "smsSent": true
  }
}
```

**Error (409):**
```json
{
  "error": "Duplicate Queue Entry",
  "message": "Patient already has an active queue for this service",
  "data": {
    "queueNumber": "CARD-001",
    "status": "Waiting",
    "joinedAt": "2026-01-25T09:00:00.000Z"
  }
}
```

### 2.2 Get Queue Status
**GET** `/queues/status/:queueNumber`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "queue": {
      "id": 1,
      "queueNumber": "CARD-001",
      "status": "Waiting",
      "serviceType": "Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "estimatedWaitTime": 15,
      "patient": {
        "user": {
          "firstName": "Abebe",
          "lastName": "Kebede",
          "phoneNumber": "+251911234567"
        }
      }
    },
    "position": 3,
    "estimatedWaitTime": 45
  }
}
```

---

## 3. Doctor Endpoints

### 3.1 Get Active Queues for Doctor
**GET** `/api/doctor/active-queues`

**Headers:** `Authorization: Bearer <doctor-token>`

**Query Parameters:** `?department=Cardiology`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "department": "Cardiology",
    "currentPatient": {
      "id": 1,
      "queueNumber": "CARD-001",
      "status": "InProgress",
      "patient": {
        "user": {
          "firstName": "Abebe",
          "lastName": "Kebede",
          "phoneNumber": "+251911234567"
        }
      }
    },
    "waitingPatients": [
      {
        "id": 2,
        "queueNumber": "CARD-002",
        "priority": "High",
        "patient": {
          "user": {
            "firstName": "Tigist",
            "lastName": "Haile",
            "phoneNumber": "+251912345678"
          }
        }
      }
    ],
    "statistics": {
      "totalWaiting": 5,
      "urgentCases": 1,
      "highPriority": 2,
      "averageWaitTime": 18
    },
    "doctorId": 1
  }
}
```

### 3.2 Call Next Patient
**POST** `/api/doctor/call-next`

**Headers:** `Authorization: Bearer <doctor-token>`

**Request Body:**
```json
{
  "department": "Cardiology"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Next patient called successfully",
  "data": {
    "calledPatient": {
      "id": 2,
      "queueNumber": "CARD-002",
      "status": "InProgress",
      "patient": {
        "user": {
          "firstName": "Tigist",
          "lastName": "Haile",
          "phoneNumber": "+251912345678"
        }
      }
    },
    "department": "Cardiology",
    "doctorId": 1,
    "smsSent": true
  }
}
```

**Error (409):**
```json
{
  "error": "Conflict",
  "message": "Doctor already has a patient in progress"
}
```

### 3.3 Complete Current Patient
**POST** `/api/doctor/complete-patient`

**Headers:** `Authorization: Bearer <doctor-token>`

**Request Body:**
```json
{
  "notes": "Patient responded well to treatment. Follow-up in 2 weeks."
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Patient consultation completed successfully",
  "data": {
    "completedPatient": {
      "id": 1,
      "queueNumber": "CARD-001",
      "status": "Complete",
      "serviceEndTime": "2026-01-25T10:15:00.000Z",
      "actualWaitTime": 25
    },
    "actualServiceTime": 25,
    "doctorId": 1,
    "smsSent": true
  }
}
```

### 3.4 Get Queue Statistics
**GET** `/api/doctor/statistics`

**Headers:** `Authorization: Bearer <doctor-token>`

**Query Parameters:** `?department=Cardiology&dateRange=today`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "department": "Cardiology",
    "dateRange": "today",
    "statistics": [
      {
        "status": "Complete",
        "count": 8,
        "avgServiceTime": 18.5
      },
      {
        "status": "Waiting",
        "count": 3,
        "avgServiceTime": null
      }
    ],
    "totalServed": 8,
    "doctorId": 1
  }
}
```

---

## 4. Display Endpoints

### 4.1 Get Queue Display (Public Display)
**GET** `/api/display/queues`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "department": "Cardiology",
        "currentlyServing": {
          "queueNumber": "CARD-001",
          "patientName": "Abebe Kebede",
          "doctorName": "Dr. John Doe",
          "serviceStartTime": "2026-01-25T09:30:00.000Z",
          "estimatedDuration": 15
        },
        "waitingPatients": [
          {
            "queueNumber": "CARD-002",
            "patientName": "Tigist Haile",
            "priority": "High",
            "joinedAt": "2026-01-25T09:15:00.000Z",
            "estimatedWaitTime": 30
          }
        ],
        "statistics": {
          "totalWaiting": 5,
          "currentlyInProgress": 1,
          "averageWaitTime": 18,
          "lastUpdated": "2026-01-25T09:45:00.000Z"
        }
      }
    ],
    "timestamp": "2026-01-25T09:45:00.000Z",
    "totalDepartments": 1
  }
}
```

### 4.2 Search Queue Status
**GET** `/api/display/search/:queueNumber`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "queue": {
      "queueNumber": "CARD-001",
      "status": "InProgress",
      "serviceType": "Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "joinedAt": "2026-01-25T09:00:00.000Z",
      "serviceStartTime": "2026-01-25T09:30:00.000Z"
    },
    "patient": {
      "name": "Abebe Kebede",
      "phoneNumber": "+251911234567"
    },
    "doctor": {
      "name": "Dr. John Doe"
    },
    "positionInQueue": null,
    "estimatedWaitTime": null,
    "departmentStatus": {
      "waitingCount": 4,
      "inProgressCount": 1,
      "totalActive": 5
    },
    "lastUpdated": "2026-01-25T09:45:00.000Z"
  }
}
```

### 4.3 Search by Phone Number
**GET** `/api/display/search-by-phone`

**Query Parameters:** `?phoneNumber=+251911234567`

**Success (200):**
```json
{
  "success": true,
  "data": {
    "patient": {
      "name": "Abebe Kebede",
      "phoneNumber": "+251911234567"
    },
    "activeQueues": [
      {
        "queueNumber": "CARD-001",
        "status": "InProgress",
        "serviceType": "Consultation",
        "department": "Cardiology",
        "joinedAt": "2026-01-25T09:00:00.000Z",
        "estimatedWaitTime": 15
      }
    ],
    "completedQueues": [
      {
        "queueNumber": "LAB-005",
        "serviceType": "Blood Test",
        "department": "Laboratory",
        "completedAt": "2026-01-24T14:30:00.000Z",
        "actualWaitTime": 20
      }
    ],
    "totalQueues": 2
  }
}
```

---

## 5. Health Check

### 5.1 API Health Check
**GET** `/health`

**Success (200):**
```json
{
  "status": "OK",
  "message": "Black Lion Hospital DQMS API is running",
  "timestamp": "2026-01-25T09:45:00.000Z"
}
```

---

## Testing Workflow Scenarios

### Scenario 1: Complete User Registration and Login Flow
1. **Register New User** → Create user account
2. **Login** → Get JWT token
3. **Create Patient Profile** → (For patients only)
4. **Get Current User** → Verify profile data
5. **Logout** → End session

### Scenario 2: Complete Patient Flow
1. **Register Patient User** → Create patient account
2. **Create Patient Profile** → Add medical details
3. **Login as Patient** → Get patient JWT token
4. **Request Queue Number** → Patient checks in
5. **Login as Doctor** → Get doctor JWT token
6. **Get Active Queues** → Doctor sees waiting patients
7. **Call Next Patient** → Doctor calls patient
8. **Complete Patient** → Doctor finishes consultation
9. **Check Queue Display** → Verify public display updates

### Scenario 3: Queue Status Tracking
1. **Register and Login** → Get authentication tokens
2. **Request Queue Number** → Create new queue entry
3. **Get Queue Status** → Track position and wait time
4. **Search by Phone Number** → Find patient queues
5. **Monitor Display** → Watch public display updates

### Scenario 4: Error Handling
1. **Invalid Registration** → Test validation errors
2. **Duplicate Registration** → Test conflict handling
3. **Invalid Login** → Test authentication errors
4. **Duplicate Queue Request** → Test conflict handling
5. **Invalid Queue Number** → Test 404 handling
6. **Unauthorized Access** → Test role-based access

---

## Postman Collection Setup

### Environment Variables
```
base_url = http://localhost:3000/api/v1
patient_token = <jwt-token-from-patient-login>
doctor_token = <jwt-token-from-doctor-login>
admin_token = <jwt-token-from-admin-login>
```

### Test Scripts
```javascript
// Registration test - Save user data
pm.test("User registered successfully", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    if (jsonData.data?.user?.email) {
        pm.environment.set("test_email", jsonData.data.user.email);
    }
});

// Login test - Save token
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

if (pm.response.json().data?.token) {
    pm.environment.set("doctor_token", pm.response.json().data.token);
}

// Queue request test - Save queue number
pm.test("Queue created successfully", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();
    if (jsonData.data?.queue?.queueNumber) {
        pm.environment.set("queue_number", jsonData.data.queue.queueNumber);
    }
});
```

## Sample Registration and Login Sequence

### Step 1: Register a Doctor
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "dr_john_doe",
    "email": "doctor@blacklion.gov.et",
    "password": "password123",
    "role": "Doctor",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+251911234567"
  }'
```

### Step 2: Register a Patient
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "patient_abebe",
    "email": "patient@blacklion.gov.et",
    "password": "password123",
    "role": "Patient",
    "firstName": "Abebe",
    "lastName": "Kebede",
    "phoneNumber": "+251913345678"
  }'
```

### Step 3: Login as Patient and Create Profile
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "patient@blacklion.gov.et",
    "password": "password123"
  }'

# Create patient profile (use token from login)
curl -X POST http://localhost:3000/api/v1/auth/create-patient-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <patient-token>" \
  -d '{
    "cardNumber": "MRN123456",
    "medicalRecordNumber": "MRN123456",
    "dateOfBirth": "1990-01-01",
    "gender": "Male",
    "address": "Addis Ababa, Ethiopia",
    "emergencyContactName": "Emergency Contact",
    "emergencyContactPhone": "+251912345678",
    "bloodType": "O+",
    "allergies": "None",
    "chronicConditions": "None"
  }'
```

---

## Common Error Codes

| Code | Description | Common Cause |
|------|-------------|--------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid/missing authentication |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or state conflict |
| 500 | Internal Server Error | Server-side error |

---

## Tips for Testing

1. **Start with health check** to verify server is running
2. **Test user registration first** to create test accounts
3. **Test authentication** to get tokens for protected routes
4. **Use realistic data** following Ethiopian phone formats (+2519xxxxxxxx)
5. **Test error scenarios** to understand API behavior
6. **Monitor console logs** for mock EMR and SMS notifications
7. **Verify database state** after each operation
8. **Test role-based access** with different user types
9. **Create patient profiles** before testing queue operations
10. **Test complete workflows** from registration to queue completion

## User Registration Workflow

### Required Steps for Patients:
1. **Register User Account** → Create basic user credentials
2. **Login** → Get JWT authentication token
3. **Create Patient Profile** → Add medical and contact details
4. **Use Queue Services** → Check-in and manage appointments

### Required Steps for Staff (Doctors/Lab Technicians):
1. **Register User Account** → Create staff credentials
2. **Login** → Get JWT authentication token
3. **Access Professional Features** → Manage queues and patients

### Required Steps for Admins:
1. **Register User Account** → Create admin credentials
2. **Login** → Get JWT authentication token
3. **System Management** → Manage users and system settings

---

## Mock Services Notice

This API uses mock services for:
- **EMR Integration**: All patient card validations return mock data
- **SMS Notifications**: Messages are logged to console instead of being sent

Check the console for logs like:
```
[MOCK EMR CALL]: Validating patient card MRN123456
[SMS SENT TO +251911234567]: Dear Abebe, your queue number is CARD-001...
```

---

## Performance Testing

For load testing, consider:
- Rate limiting: 100 requests per 15 minutes per IP
- Concurrent queue requests
- Multiple doctors calling patients simultaneously
- Display endpoint refresh rates

Monitor response times:
- Health check: <50ms
- Authentication: <200ms
- Queue operations: <300ms
- Display updates: <500ms
