# Digital Queue Management System (DQMS)

### For Tikur Anbessa Specialized Hospital (Black Lion Hospital)

**Department of Computer Science, Addis Ababa University**

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Team](#project-team)
3. [System Architecture](#system-architecture)
   - [Tech Stack](#tech-stack)
   - [Subsystem Decomposition](#subsystem-decomposition)
4. [Functional Modules](#functional-modules)
5. [Transaction Scenarios & Workflows](#transaction-scenarios--workflows)
6. [Compliance & Interoperability](#compliance--interoperability)
7. [Security & Access Control](#security--access-control)
8. [Installation & Deployment](#installation--deployment)

---

## Executive Summary

The **Digital Queue Management System (DQMS)** is an enterprise-grade software solution developed for **Tikur Anbessa Specialized Hospital (Black Lion Hospital)**. It addresses the critical challenge of patient congestion and long wait times in outpatient departments and laboratories.

Unlike standalone queuing tools, this system is designed to integrate seamlessly with the hospital's existing **Ewket Electronic Medical Record (EMR)** and **Hospital Information System (HIS)**. It leverages **HL7 FHIR** standards to ensure data consistency and interoperability.

**Key Objectives:**

- **Optimize Patient Flow:** Reduce wait times through intelligent queue allocation and estimation.
- **Real-time Visibility:** Provide patients and staff with live status updates via digital displays and SMS.
- **Accessibility:** Ensure inclusivity with Amharic/English support and voice-based announcements for visually impaired patients.
- **Operational Efficiency:** specialized dashboards for Doctors and Lab Technicians to manage service delivery.

---

## Project Team

**Advisor:** Aderaw Semma

**Development Team:**

1.  **Adonias Abiyot** (UGR/0796/15)
2.  **Eyob Assayie** (UGR/1219/16)
3.  **Samuel Kinfe** (UGR/2027/16)
4.  **Sawel Yohannes** (UGR/2969/16)
5.  **Tsegaye Shewamare** (UGR/2048/16)

---

## System Architecture

The DQMS employs a modular, **Client-Server Architecture** utilizing a Layered Approach to ensure scalability, maintainability, and security. It is designed to operate within the hospital's **Wide Area Network (WAN)**.

### Tech Stack

- **Frontend (Presentation Layer):** React (TypeScript), Vite, Tailwind CSS. Optimized for Chrome v129+.
- **Backend (Application Logic):** Node.js with Express.js runtime.
- **Database (Data Layer):** PostgreSQL.
- **Real-time Engine:** Socket.io for bi-directional event communication.
- **Infrastructure:** Nginx Web Server, Linux (Ubuntu 20.04 LTS).

### Subsystem Decomposition

1.  **User Interface (UI) Subsystem:** Handles interactions for Patients (Kiosk/Mobile), Staff (Dashboards), and Public Displays.
2.  **Application Logic Subsystem:** Core business rules for queue algorithms, token management, and notification scheduling.
3.  **Data Management Subsystem:** Manages persistent storage of User profiles, Queue records, and immutable Activity Logs.
4.  **External Integration Subsystem:** Manages communication with:
    - **Ewket EMR:** via HL7 FHIR APIs (Patient, Appointment resources).
    - **SMS Gateway:** For patient notifications.

---

## Functional Modules

### 1. Patient Portal & Kiosk

- **Queue Request:** Patients can request a ticket using their Medical Record Number (MRN).
- **Live Status:** Real-time view of queue position and Estimated Wait Time (EWT).
- **Notifications:** SMS alerts when the turn is approaching (>5 mins) or when Lab results are ready.

### 2. Doctor Dashboard

- **Session Management:** Mark availability (Available/In-Session/Break).
- **Patient Calling:** "Next Patient" trigger broadcasts events to Public Displays and Audio systems.
- **Consultation:** View basic patient demographics and queue history.

### 3. Laboratory Module

- **Test Tracking:** Manage queue for sample collection and result processing.
- **Automated Recall:** Completing a test result automatically notifies the patient to return to the Doctor, re-inserting them into the consultation queue with updated priority.

### 4. Public Display System

- **Passive Subscriber:** Listens for `queue:update` and `queue:call` events via WebSockets.
- **Audio Synthesis:** Integrated Text-to-Speech (Audixa/MeSpeak) for multilingual voice announcements.
- **High Contrast UI:** Designed for visibility on large hall screens.

---

## Transaction Scenarios & Workflows

### Patient Check-in & Assignment

1.  **Initiation:** Patient enters Card Number at Reception or Kiosk.
2.  **Verification:** System queries local DB (and optionally Ewket EMR) to validate usage.
3.  **Calculation:** Algorithm computes EWT based on:
    - Current active doctors in the department.
    - Average service time (moving average).
    - Current queue length.
4.  **Creation:** API generates a `QueueEntry` with `Waiting` status and a unique Ticket Number (e.g., `CARD-001`).

### Service Delivery Cycle

1.  **Call:** Doctor clicks "Call Next".
2.  **State Transition:**
    - Current patient: `InProgress` -> `Completed`.
    - Next patient: `Waiting` -> `InProgress`.
3.  **Broadcast:** Backend emits `socket.emit('queue:call', { ticket: 'CARD-001', room: 'Rm 3' })`.
4.  **Activity Log:** Action is recorded in `ActivityLogs` table with timestamp and actor UUID.

### Laboratory Integration Workflow

1.  **referral:** Doctor requests Lab Work.
2.  **Test Processing:** Lab Tech processes sample.
3.  **Completion:** Tech marks "Results Ready".
4.  **Trigger:** System sends SMS to patient: "Your results are ready. Please proceed to Doctor X."

---

## Compliance & Interoperability

The system adheres to strict standards to ensure it fits within the national digital health ecosystem:

- **Ethiopian National Digital Health Blueprint:** Alignment with national eHealth strategies.
- **WHO Digital Health Interoperability Framework:** Ensuring standardized architecture.
- **HL7 FHIR:** Utilizes standard resources (Patient, Encounter, Observation) for data exchange.
- **WCAG:** Web Content Accessibility Guidelines compliance for visual impairments.

---

## Security & Access Control

- **RBAC (Role-Based Access Control):**
  - `Admin`: Full system configuration.
  - `Doctor/Lab`: Queue manipulation only.
  - `Patient`: Read-only access to own status.
- **Encryption:** All data in transit provided via **TLS 1.2+ (HTTPS)**. Passwords hashed via **bcrypt**.
- **Audit Trails:** User actions (Logins, Status Changes) are immutably logged for security auditing.
- **Data Privacy:** Minimal medical data storage; relies on EMR for clinical history to minimize exposure.
