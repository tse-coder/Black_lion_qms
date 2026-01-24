# Black Lion Hospital DQMS - API Contract

## Overview
This document contains the API contract for the Digital Queue Management System (DQMS) backend endpoints.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require JWT token authentication except where noted.

## Roles
- `Patient` - Can join queues and view their status
- `Doctor` - Can manage patient queues and update status
- `Lab Technician` - Can manage lab queues
- `Admin` - Full system access

## Endpoints

### Queue Management
- `GET /queues` - List all queues
- `POST /queues` - Create new queue
- `GET /queues/:id` - Get queue details
- `PUT /queues/:id` - Update queue
- `DELETE /queues/:id` - Delete queue

### Patient Management
- `GET /patients` - List patients
- `POST /patients` - Register new patient
- `GET /patients/:id` - Get patient details
- `PUT /patients/:id` - Update patient information

### Queue Operations
- `POST /queues/:queueId/join` - Patient joins queue
- `PUT /queues/:queueId/next` - Call next patient
- `PUT /queues/:queueId/status` - Update patient status
- `GET /queues/:queueId/status` - Get current queue status

### Notifications
- `POST /notifications/sms` - Send SMS notification
- `GET /notifications/history` - Get notification history

### EMR Integration
- `GET /emr/patient/:cardNumber` - Validate patient card
- `GET /emr/patient/:id/history` - Get patient medical history

---

*This document will be updated as new endpoints are implemented.*
