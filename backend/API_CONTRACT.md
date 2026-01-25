# Black Lion Hospital DQMS - API Contract

## Overview
This document contains the API contract for the Digital Queue Management System (DQMS) backend endpoints.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT token authentication except where noted. Use the `Authorization` header with Bearer token format.

## Frontend Setup

### JWT Token Usage
```javascript
// After login, store the token
localStorage.setItem('token', response.data.token);

// Include token in all authenticated requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};

// Example fetch request
fetch('/api/v1/users/profile', {
  method: 'GET',
  headers: headers
})
.then(response => response.json())
.then(data => console.log(data));
```

### Axios Setup (Recommended)
```javascript
import axios from 'axios';

// Create axios instance with default headers
const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Roles
- `Patient` - Can join queues and view their status
- `Doctor` - Can manage patient queues and update status
- `Lab Technician` - Can manage lab queues
- `Admin` - Full system access

---

## Authentication Endpoints

### POST /auth/register
**Description:** User registration
**Public Endpoint:** No authentication required

**Request Body:**
```json
{
  "username": "testuser123",
  "email": "user@example.com",
  "password": "password123",
  "role": "Patient|Doctor|Lab Technician|Admin",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+251912345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "username": "testuser123",
      "email": "user@example.com",
      "role": "Patient",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251912345678",
      "isActive": true,
      "createdAt": "2024-01-25T10:30:00.000Z"
    }
  }
}
```

### POST /auth/login
**Description:** User login with email and password
**Public Endpoint:** No authentication required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "username",
      "email": "user@example.com",
      "role": "Patient|Doctor|Lab Technician|Admin",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251912345678",
      "lastLogin": "2024-01-25T10:30:00.000Z"
    },
    "token": "jwt_token_here",
    "expiresIn": "24h"
  }
}
```

### GET /auth/me
**Description:** Get current authenticated user profile
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "username",
      "email": "user@example.com",
      "role": "Patient",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251912345678",
      "isActive": true,
      "lastLogin": "2024-01-25T10:30:00.000Z"
    }
  }
}
```

### POST /auth/logout
**Description:** Logout current user
**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /auth/create-patient-profile
**Description:** Create patient profile for authenticated user
**Authentication:** Required (Patient role)

**Request Body:**
```json
{
  "cardNumber": "CARD-001",
  "medicalRecordNumber": "MRN-2023-001",
  "dateOfBirth": "1985-05-15",
  "gender": "Male|Female|Other",
  "address": "123 Main St, Addis Ababa",
  "emergencyContactName": "Emergency Contact",
  "emergencyContactPhone": "+251912345678",
  "bloodType": "A+|A-|B+|B-|AB+|AB-|O+|O-",
  "allergies": "Penicillin, Peanuts",
  "chronicConditions": "Hypertension"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient profile created successfully",
  "data": {
    "patient": {
      "id": "uuid",
      "cardNumber": "CARD-001",
      "medicalRecordNumber": "MRN-2023-001",
      "dateOfBirth": "1985-05-15",
      "gender": "Male",
      "address": "123 Main St, Addis Ababa",
      "emergencyContactName": "Emergency Contact",
      "emergencyContactPhone": "+251912345678",
      "bloodType": "O+",
      "allergies": "Penicillin, Peanuts",
      "chronicConditions": "Hypertension",
      "userId": "user_uuid",
      "createdAt": "2024-01-25T10:30:00.000Z"
    }
  }
}
```

---

## Queue Management Endpoints

### POST /queues/request
**Description:** Request queue number (Patient Check-in)
**Public Endpoint:** No authentication required

**Request Body:**
```json
{
  "cardNumber": "CARD-001",
  "department": "Cardiology",
  "serviceType": "General Consultation|Specialist|Laboratory|Radiology|Pharmacy|Emergency",
  "priority": "Low|Medium|High|Urgent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Queue number assigned successfully",
  "data": {
    "queue": {
      "id": "uuid",
      "queueNumber": "CARD-001",
      "status": "Waiting",
      "serviceType": "General Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "joinedAt": "2024-01-25T10:30:00.000Z",
      "estimatedWaitTime": 15,
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
      "cardNumber": "CARD-001",
      "medicalRecordNumber": "MRN-2023-001"
    },
    "estimatedWaitTime": 15,
    "smsSent": true
  }
}
```

### GET /queues/status/:queueNumber
**Description:** Get queue status by queue number
**Public Endpoint:** No authentication required

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": {
      "id": "uuid",
      "queueNumber": "CARD-001",
      "status": "Waiting|InProgress|Complete|Cancelled",
      "serviceType": "General Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "joinedAt": "2024-01-25T10:30:00.000Z",
      "estimatedWaitTime": 15
    },
    "patient": {
      "name": "Abebe Kebede",
      "phoneNumber": "+251911234567"
    },
    "position": 3,
    "estimatedWaitTime": 45,
    "departmentStatus": {
      "waitingCount": 5,
      "inProgressCount": 2,
      "totalActive": 7
    }
  }
}
```

### GET /queues
**Description:** Get queues based on user role
**Authentication:** Required

**Response (Patient):**
```json
{
  "success": true,
  "data": {
    "queues": [
      {
        "id": "uuid",
        "queueNumber": "CARD-001",
        "status": "Waiting",
        "serviceType": "General Consultation",
        "department": "Cardiology",
        "joinedAt": "2024-01-25T10:30:00.000Z",
        "estimatedWaitTime": 15
      }
    ]
  }
}
```

### POST /queues
**Description:** Create new queue entry
**Authentication:** Required (Doctor, Lab Technician, Admin)
**Request Body:**
```json
{
  "patientId": "patient_uuid",
  "serviceType": "General Consultation",
  "department": "Cardiology",
  "priority": "Medium",
  "notes": "Optional notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Queue entry created successfully",
  "data": {
    "queue": {
      "id": "uuid",
      "queueNumber": "CARD-002",
      "status": "Waiting",
      "serviceType": "General Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "joinedAt": "2024-01-25T10:30:00.000Z"
    }
  }
}
```

### PUT /queues/:id/status
**Description:** Update queue status
**Authentication:** Required (Doctor, Lab Technician, Admin)
**Request Body:**
```json
{
  "status": "Waiting|InProgress|Complete|Cancelled",
  "notes": "Optional notes"
}
```

### PUT /queues/:queueId/next
**Description:** Call next patient
**Authentication:** Required (Doctor, Lab Technician, Admin)

**Response:**
```json
{
  "success": true,
  "message": "Next patient called successfully",
  "data": {
    "previousQueue": {
      "id": "uuid",
      "queueNumber": "CARD-001",
      "status": "Complete"
    },
    "nextQueue": {
      "id": "uuid",
      "queueNumber": "CARD-002",
      "status": "InProgress",
      "patient": {
        "user": {
          "firstName": "Tigist",
          "lastName": "Haile",
          "phoneNumber": "+251912345678"
        }
      }
    }
  }
}
```

---

## Doctor Queue Management Endpoints

### GET /api/queue/active
**Description:** Get active queues for doctor's department
**Authentication:** Required (Doctor only)

**Response:**
```json
{
  "success": true,
  "data": {
    "department": "Cardiology",
    "currentPatient": {
      "id": "uuid",
      "queueNumber": "CARD-001",
      "patient": {
        "user": {
          "firstName": "Abebe",
          "lastName": "Kebede"
        }
      },
      "serviceStartTime": "2024-01-25T10:30:00.000Z"
    },
    "waitingPatients": [
      {
        "queueNumber": "CARD-002",
        "patient": {
          "user": {
            "firstName": "Tigist",
            "lastName": "Haile"
          }
        },
        "priority": "Medium",
        "joinedAt": "2024-01-25T10:45:00.000Z"
      }
    ],
    "statistics": {
      "totalWaiting": 5,
      "urgentCases": 1,
      "highPriority": 2,
      "averageWaitTime": 25
    },
    "doctorId": "uuid"
  }
}
```

### PATCH /api/queue/call-next
**Description:** Call next patient (Waiting → InProgress)
**Authentication:** Required (Doctor only)
**Request Body:**
```json
{
  "department": "Cardiology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Next patient called successfully",
  "data": {
    "calledPatient": {
      "id": "uuid",
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
    "doctorId": "uuid",
    "smsSent": true
  }
}
```

### PATCH /api/queue/complete
**Description:** Complete current patient (InProgress → Complete)
**Authentication:** Required (Doctor only)
**Request Body:**
```json
{
  "notes": "Optional consultation notes"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Patient consultation completed successfully",
  "data": {
    "completedPatient": {
      "id": "uuid",
      "queueNumber": "CARD-002",
      "status": "Complete",
      "serviceEndTime": "2024-01-25T11:15:00.000Z",
      "actualServiceTime": 45
    },
    "actualServiceTime": 45,
    "doctorId": "uuid",
    "smsSent": true
  }
}
```

### GET /api/queue/statistics
**Description:** Get doctor's queue statistics
**Authentication:** Required (Doctor only)
**Query Parameters:** `department` (required), `dateRange` (optional: today, week, month)

**Response:**
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
        "avgServiceTime": 25
      },
      {
        "status": "Waiting",
        "count": 3
      }
    ],
    "totalServed": 8,
    "doctorId": "uuid"
  }
}
```

---

## Public Queue Display Endpoints

### GET /api/queue/display
**Description:** Get currently serving numbers for all departments
**Public Endpoint:** No authentication required

**Response:**
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
          "doctorName": "Dr. Solomon Tesfaye",
          "serviceStartTime": "2024-01-25T10:30:00.000Z",
          "estimatedDuration": 25
        },
        "waitingPatients": [
          {
            "queueNumber": "CARD-002",
            "patientName": "Tigist Haile",
            "priority": "Medium",
            "joinedAt": "2024-01-25T10:45:00.000Z",
            "estimatedWaitTime": 30
          }
        ],
        "statistics": {
          "totalWaiting": 5,
          "currentlyInProgress": 1,
          "averageWaitTime": 25,
          "lastUpdated": "2024-01-25T11:00:00.000Z"
        }
      }
    ],
    "timestamp": "2024-01-25T11:00:00.000Z",
    "totalDepartments": 5
  }
}
```

### GET /api/queue/search/:queueNumber
**Description:** Search queue status by queue number
**Public Endpoint:** No authentication required

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": {
      "queueNumber": "CARD-001",
      "status": "Waiting",
      "serviceType": "General Consultation",
      "department": "Cardiology",
      "priority": "Medium",
      "joinedAt": "2024-01-25T10:30:00.000Z"
    },
    "patient": {
      "name": "Abebe Kebede",
      "phoneNumber": "+251911234567"
    },
    "position": 3,
    "estimatedWaitTime": 45,
    "departmentStatus": {
      "waitingCount": 5,
      "inProgressCount": 1,
      "totalActive": 6
    },
    "lastUpdated": "2024-01-25T11:00:00.000Z"
  }
}
```

### GET /api/queue/search-by-phone
**Description:** Search queues by phone number
**Public Endpoint:** No authentication required
**Query Parameters:** `phoneNumber` (required, Ethiopian format: +2519xxxxxxxx)

**Response:**
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
        "status": "Waiting",
        "serviceType": "General Consultation",
        "department": "Cardiology",
        "joinedAt": "2024-01-25T10:30:00.000Z",
        "estimatedWaitTime": 15
      }
    ],
    "completedQueues": [
      {
        "queueNumber": "CARD-099",
        "serviceType": "Laboratory",
        "department": "Laboratory",
        "completedAt": "2024-01-24T15:30:00.000Z",
        "actualWaitTime": 20
      }
    ],
    "totalQueues": 5
  }
}
```

---

## User Management Endpoints

### GET /users
**Description:** List all users
**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "username",
        "email": "user@example.com",
        "role": "Patient",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+251912345678",
        "isActive": true,
        "lastLogin": "2024-01-25T10:30:00.000Z"
      }
    ]
  }
}
```

### GET /users/:id
**Description:** Get user by ID
**Authentication:** Required (Admin or own user)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "username",
      "email": "user@example.com",
      "role": "Patient",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+251912345678",
      "isActive": true,
      "lastLogin": "2024-01-25T10:30:00.000Z"
    }
  }
}
```

---

## Patient Management Endpoints

### GET /patients
**Description:** List patients (role-based access)
**Authentication:** Required

**Response (Doctor):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "uuid",
        "cardNumber": "CARD-001",
        "medicalRecordNumber": "MRN-2023-001",
        "dateOfBirth": "1985-05-15",
        "gender": "Male",
        "bloodType": "O+",
        "user": {
          "firstName": "Abebe",
          "lastName": "Kebede",
          "email": "abebe@example.com",
          "phoneNumber": "+251911234567",
          "role": "Patient"
        },
        "queues": [
          {
            "id": "uuid",
            "queueNumber": "CARD-001",
            "status": "Waiting",
            "serviceType": "General Consultation"
          }
        ]
      }
    ]
  }
}
```

### GET /patients/:id
**Description:** Get patient by ID
**Authentication:** Required (role-based access)

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "uuid",
      "cardNumber": "CARD-001",
      "medicalRecordNumber": "MRN-2023-001",
      "dateOfBirth": "1985-05-15",
      "gender": "Male",
      "bloodType": "O+",
      "allergies": "Penicillin, Peanuts",
      "chronicConditions": "Hypertension",
      "user": {
        "firstName": "Abebe",
        "lastName": "Kebede",
        "email": "abebe@example.com",
        "phoneNumber": "+251911234567",
        "role": "Patient"
      },
      "queues": [
        {
          "id": "uuid",
          "queueNumber": "CARD-001",
          "status": "Waiting",
          "serviceType": "General Consultation",
          "department": "Cardiology",
          "doctor": {
            "firstName": "Solomon",
            "lastName": "Tesfaye"
          }
        }
      ]
    }
  }
}
```

---

## Notification Endpoints

### POST /notifications/sms
**Description:** Send SMS notification
**Authentication:** Required (Doctor, Lab Technician, Admin)
**Request Body:**
```json
{
  "phoneNumber": "+251912345678",
  "message": "Your queue number is ready",
  "patientId": "patient_uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "data": {
    "phoneNumber": "+251912345678",
    "message": "Your queue number is ready",
    "sentAt": "2024-01-25T11:00:00.000Z",
    "patientId": "patient_uuid"
  }
}
```

### GET /notifications/history
**Description:** Get notification history
**Authentication:** Required (Admin only)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "1",
        "type": "SMS",
        "recipient": "+251912345678",
        "message": "Your queue number is ready",
        "sentAt": "2024-01-25T10:30:00.000Z",
        "status": "sent",
        "patientId": "patient_uuid"
      }
    ]
  }
}
```

---

## Health Check Endpoint

### GET /health
**Description:** API health check
**Public Endpoint:** No authentication required

**Response:**
```json
{
  "status": "OK",
  "message": "Black Lion Hospital DQMS API is running",
  "timestamp": "2024-01-25T11:00:00.000Z"
}
```

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": ["Additional error details"] // Optional
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `409` - Conflict (Duplicate resource)
- `500` - Internal Server Error

---

## Testing with Mock EMR Cards

Use these test card numbers for testing patient check-in:
- `CARD-001` - Abebe Kebede (Male, 38, Hypertension, Diabetes)
- `CARD-002` - Tigist Haile (Female, 31, No conditions)
- `CARD-003` - Mohamed Hassan (Male, 45, Asthma)
- `CARD-004` - Almaz Bekele (Female, 58, Hypertension, Arthritis)
- `CARD-005` - Samuel Tadesse (Male, 22, No conditions)

---

*This document will be updated as new endpoints are implemented.*

*This document will be updated as new endpoints are implemented.*
