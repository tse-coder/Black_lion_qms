// EMR Integration Service (Mock Implementation)
// As per project rules: All methods should return mock JSON data and log [MOCK EMR CALL]

class EmrService {
  constructor() {
    // Initialize mock patient database
    this.mockPatients = {
      'CARD-001': {
        id: 'patient-uuid-001',
        cardNumber: 'CARD-001',
        medicalRecordNumber: 'MRN-2023-001',
        firstName: 'Abebe',
        lastName: 'Kebede',
        dateOfBirth: '1985-05-15',
        gender: 'Male',
        phoneNumber: '+251911234567',
        email: 'abebe.kebede@email.com',
        address: 'Bole, Addis Ababa',
        emergencyContactName: 'Tigist Kebede',
        emergencyContactPhone: '+251911234568',
        bloodType: 'O+',
        allergies: 'Penicillin, Peanuts',
        chronicConditions: 'Hypertension, Type 2 Diabetes',
        isActive: true,
        registrationDate: '2020-01-15',
        lastVisit: '2023-12-15',
        insuranceProvider: 'Ethiopian Insurance',
        insurancePolicyNumber: 'EI-123456',
      },
      'CARD-002': {
        id: 'patient-uuid-002',
        cardNumber: 'CARD-002',
        medicalRecordNumber: 'MRN-2023-002',
        firstName: 'Tigist',
        lastName: 'Haile',
        dateOfBirth: '1992-08-22',
        gender: 'Female',
        phoneNumber: '+251912345678',
        email: 'tigist.haile@email.com',
        address: 'Kirkos, Addis Ababa',
        emergencyContactName: 'Haile Mariam',
        emergencyContactPhone: '+251912345679',
        bloodType: 'A+',
        allergies: 'None',
        chronicConditions: 'None',
        isActive: true,
        registrationDate: '2021-03-20',
        lastVisit: '2023-12-20',
        insuranceProvider: 'Nile Insurance',
        insurancePolicyNumber: 'NI-789012',
      },
      'CARD-003': {
        id: 'patient-uuid-003',
        cardNumber: 'CARD-003',
        medicalRecordNumber: 'MRN-2023-003',
        firstName: 'Mohamed',
        lastName: 'Hassan',
        dateOfBirth: '1978-11-30',
        gender: 'Male',
        phoneNumber: '+251913456789',
        email: 'mohamed.hassan@email.com',
        address: 'Arada, Addis Ababa',
        emergencyContactName: 'Fatima Hassan',
        emergencyContactPhone: '+251913456790',
        bloodType: 'B+',
        allergies: 'Sulfa drugs',
        chronicConditions: 'Asthma',
        isActive: true,
        registrationDate: '2019-07-10',
        lastVisit: '2023-12-18',
        insuranceProvider: 'Awash Insurance',
        insurancePolicyNumber: 'AI-345678',
      },
      'CARD-004': {
        id: 'patient-uuid-004',
        cardNumber: 'CARD-004',
        medicalRecordNumber: 'MRN-2023-004',
        firstName: 'Almaz',
        lastName: 'Bekele',
        dateOfBirth: '1965-03-12',
        gender: 'Female',
        phoneNumber: '+251914567890',
        email: 'almaz.bekele@email.com',
        address: 'Yeka, Addis Ababa',
        emergencyContactName: 'Bekele Tesfaye',
        emergencyContactPhone: '+251914567891',
        bloodType: 'AB+',
        allergies: 'Latex, Shellfish',
        chronicConditions: 'Hypertension, Arthritis',
        isActive: true,
        registrationDate: '2018-02-28',
        lastVisit: '2023-12-22',
        insuranceProvider: 'Ethiopian Insurance',
        insurancePolicyNumber: 'EI-234567',
      },
      'CARD-005': {
        id: 'patient-uuid-005',
        cardNumber: 'CARD-005',
        medicalRecordNumber: 'MRN-2023-005',
        firstName: 'Samuel',
        lastName: 'Tadesse',
        dateOfBirth: '2001-06-25',
        gender: 'Male',
        phoneNumber: '+251915678901',
        email: 'samuel.tadesse@email.com',
        address: 'Lideta, Addis Ababa',
        emergencyContactName: 'Tadesse Wondimu',
        emergencyContactPhone: '+251915678902',
        bloodType: 'O-',
        allergies: 'None',
        chronicConditions: 'None',
        isActive: true,
        registrationDate: '2022-09-15',
        lastVisit: '2023-12-25',
        insuranceProvider: 'Nile Insurance',
        insurancePolicyNumber: 'NI-890123',
      },
    };

    // Mock visit history database
    this.mockVisitHistory = {
      'patient-uuid-001': [
        {
          visitId: 'visit-001',
          date: '2023-12-15',
          time: '10:30',
          department: 'General Consultation',
          doctor: 'Dr. Mengistu Lemma',
          diagnosis: 'Upper respiratory infection',
          treatment: 'Amoxicillin 500mg, 3 times daily for 7 days',
          vitalSigns: {
            bloodPressure: '120/80',
            heartRate: '72',
            temperature: '37.2°C',
            weight: '75kg',
            height: '175cm',
          },
          followUpRequired: true,
          followUpDate: '2023-12-22',
        },
        {
          visitId: 'visit-002',
          date: '2023-11-20',
          time: '14:15',
          department: 'Laboratory',
          test: 'Complete Blood Count',
          result: 'Normal',
          orderedBy: 'Dr. Almaz Bekele',
          vitalSigns: {
            bloodPressure: '125/82',
            heartRate: '75',
            temperature: '36.8°C',
          },
          followUpRequired: false,
        },
        {
          visitId: 'visit-003',
          date: '2023-10-10',
          time: '09:00',
          department: 'Cardiology',
          doctor: 'Dr. Solomon Tesfaye',
          diagnosis: 'Controlled hypertension',
          treatment: 'Continue current medication',
          vitalSigns: {
            bloodPressure: '130/85',
            heartRate: '70',
            temperature: '36.5°C',
            weight: '76kg',
          },
          followUpRequired: true,
          followUpDate: '2023-12-15',
        },
      ],
      'patient-uuid-002': [
        {
          visitId: 'visit-004',
          date: '2023-12-20',
          time: '11:00',
          department: 'Gynecology',
          doctor: 'Dr. Sara Ahmed',
          diagnosis: 'Routine check-up',
          treatment: 'Normal findings, continue prenatal vitamins',
          vitalSigns: {
            bloodPressure: '110/70',
            heartRate: '68',
            temperature: '36.7°C',
            weight: '65kg',
          },
          followUpRequired: true,
          followUpDate: '2024-01-20',
        },
      ],
    };

    // Mock appointments database
    this.mockAppointments = {
      'patient-uuid-001': [
        {
          appointmentId: 'apt-001',
          date: '2024-01-25',
          time: '10:00',
          department: 'Cardiology',
          doctor: 'Dr. Solomon Tesfaye',
          purpose: 'Follow-up for hypertension',
          status: 'Scheduled',
          bookedDate: '2023-12-15',
        },
        {
          appointmentId: 'apt-002',
          date: '2024-02-15',
          time: '14:30',
          department: 'Laboratory',
          test: 'Lipid Profile',
          purpose: 'Routine blood work',
          status: 'Scheduled',
          bookedDate: '2023-12-15',
        },
      ],
      'patient-uuid-002': [
        {
          appointmentId: 'apt-003',
          date: '2024-01-30',
          time: '09:30',
          department: 'Gynecology',
          doctor: 'Dr. Sara Ahmed',
          purpose: 'Prenatal check-up',
          status: 'Scheduled',
          bookedDate: '2023-12-20',
        },
      ],
    };
  }

  // Validate patient card and get patient information
  async validatePatientCard(cardNumber) {
    console.log(`[MOCK EMR CALL] Validating patient card: ${cardNumber}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const patient = this.mockPatients[cardNumber];
    
    if (patient) {
      console.log(`[MOCK EMR CALL] Patient validation successful for: ${patient.firstName} ${patient.lastName}`);
      
      return {
        success: true,
        data: {
          ...patient,
          age: this.calculateAge(patient.dateOfBirth),
          fullName: `${patient.firstName} ${patient.lastName}`,
        },
        message: 'Patient card validated successfully',
        timestamp: new Date().toISOString(),
        emrSystem: 'Black Lion EMR v2.1',
      };
    } else {
      console.log(`[MOCK EMR CALL] Patient card validation failed: Card not found`);
      
      return {
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Invalid patient card number',
        timestamp: new Date().toISOString(),
        emrSystem: 'Black Lion EMR v2.1',
      };
    }
  }

  // Get patient medical history
  async getPatientHistory(patientId) {
    console.log(`[MOCK EMR CALL] Fetching patient history for: ${patientId}`);
    
    // Simulate database query delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const patient = Object.values(this.mockPatients).find(p => p.id === patientId);
    if (!patient) {
      return {
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
      };
    }

    const visits = this.mockVisitHistory[patientId] || [];
    const appointments = this.mockAppointments[patientId] || [];

    const medicalHistory = {
      patientInfo: {
        ...patient,
        age: this.calculateAge(patient.dateOfBirth),
        fullName: `${patient.firstName} ${patient.lastName}`,
      },
      visits: visits,
      medications: this.extractMedications(visits),
      allergies: patient.allergies.split(', ').map(a => a.trim()),
      chronicConditions: patient.chronicConditions.split(', ').map(c => c.trim()),
      vitalSignsTrend: this.calculateVitalSignsTrend(visits),
      upcomingAppointments: appointments.filter(apt => apt.status === 'Scheduled'),
      lastUpdated: new Date().toISOString(),
    };

    console.log(`[MOCK EMR CALL] Patient history retrieved successfully - ${visits.length} visits found`);
    
    return {
      success: true,
      data: medicalHistory,
      message: 'Patient history retrieved successfully',
      timestamp: new Date().toISOString(),
      emrSystem: 'Black Lion EMR v2.1',
    };
  }

  // Check if patient has any outstanding appointments
  async checkOutstandingAppointments(patientId) {
    console.log(`[MOCK EMR CALL] Checking outstanding appointments for: ${patientId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const appointments = this.mockAppointments[patientId] || [];
    const outstandingAppointments = appointments.filter(apt => 
      apt.status === 'Scheduled' && new Date(apt.date) >= new Date()
    );

    console.log(`[MOCK EMR CALL] Found ${outstandingAppointments.length} outstanding appointments`);
    
    return {
      success: true,
      data: {
        appointments: outstandingAppointments,
        count: outstandingAppointments.length,
      },
      message: 'Outstanding appointments retrieved',
      timestamp: new Date().toISOString(),
      emrSystem: 'Black Lion EMR v2.1',
    };
  }

  // Update patient information in EMR
  async updatePatientInfo(patientId, updateData) {
    console.log(`[MOCK EMR CALL] Updating patient information for: ${patientId}`, updateData);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const patient = Object.values(this.mockPatients).find(p => p.id === patientId);
    if (!patient) {
      return {
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
      };
    }

    // In a real EMR, this would update the database
    // For mock, we just simulate the update
    const updatedFields = Object.keys(updateData);
    
    console.log(`[MOCK EMR CALL] Patient information updated successfully - Fields: ${updatedFields.join(', ')}`);
    
    return {
      success: true,
      data: {
        patientId: patientId,
        updatedFields: updatedFields,
        updatedBy: 'DQMS_System',
        updatedAt: new Date().toISOString(),
      },
      message: 'Patient information updated in EMR',
      timestamp: new Date().toISOString(),
      emrSystem: 'Black Lion EMR v2.1',
    };
  }

  // Get patient medications
  async getPatientMedications(patientId) {
    console.log(`[MOCK EMR CALL] Fetching patient medications for: ${patientId}`);
    
    await new Promise(resolve => setTimeout(resolve, 300));

    const visits = this.mockVisitHistory[patientId] || [];
    const medications = this.extractMedications(visits);

    return {
      success: true,
      data: {
        currentMedications: medications.current,
        pastMedications: medications.past,
      },
      message: 'Patient medications retrieved',
      timestamp: new Date().toISOString(),
      emrSystem: 'Black Lion EMR v2.1',
    };
  }

  // Get patient allergies
  async getPatientAllergies(patientId) {
    console.log(`[MOCK EMR CALL] Fetching patient allergies for: ${patientId}`);
    
    await new Promise(resolve => setTimeout(resolve, 200));

    const patient = Object.values(this.mockPatients).find(p => p.id === patientId);
    if (!patient) {
      return {
        success: false,
        error: 'PATIENT_NOT_FOUND',
        message: 'Patient not found',
      };
    }

    const allergies = patient.allergies.split(', ').map(a => ({
      name: a.trim(),
      severity: a.includes('Penicillin') ? 'Severe' : 'Moderate',
      reaction: a.includes('Penicillin') ? 'Anaphylaxis' : 'Rash',
    }));

    return {
      success: true,
      data: {
        allergies: allergies,
        hasAllergies: allergies.length > 0 && allergies[0].name !== 'None',
      },
      message: 'Patient allergies retrieved',
      timestamp: new Date().toISOString(),
      emrSystem: 'Black Lion EMR v2.1',
    };
  }

  // Helper methods
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  extractMedications(visits) {
    const current = [];
    const past = [];

    visits.forEach(visit => {
      if (visit.treatment) {
        const medication = {
          name: visit.treatment.split(',')[0],
          dosage: visit.treatment,
          prescribedDate: visit.date,
          prescribedBy: visit.doctor || visit.orderedBy,
          department: visit.department,
        };

        if (visit.followUpRequired && new Date(visit.followUpDate) >= new Date()) {
          current.push(medication);
        } else {
          past.push(medication);
        }
      }
    });

    return { current, past };
  }

  calculateVitalSignsTrend(visits) {
    if (visits.length === 0) return null;

    const recentVisits = visits.slice(-3); // Last 3 visits
    const bloodPressure = recentVisits.map(v => {
      if (v.vitalSigns?.bloodPressure) {
        const [systolic, diastolic] = v.vitalSigns.bloodPressure.split('/').map(Number);
        return { date: v.date, systolic, diastolic };
      }
      return null;
    }).filter(Boolean);

    return {
      bloodPressure: bloodPressure,
      trend: bloodPressure.length >= 2 ? 
        (bloodPressure[bloodPressure.length - 1].systolic > bloodPressure[0].systolic ? 'Increasing' : 'Stable') 
        : 'Insufficient data',
    };
  }
}

export default new EmrService();
