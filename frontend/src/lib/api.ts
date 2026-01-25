import axios, { AxiosError, AxiosResponse } from 'axios';

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export type UserRole = 'Patient' | 'Doctor' | 'Lab Technician' | 'Admin';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type QueueStatus = 'Waiting' | 'InProgress' | 'Complete' | 'Cancelled';
export type ServiceType = 'General Consultation' | 'Specialist' | 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Emergency';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface Patient {
  id: string;
  cardNumber: string;
  medicalRecordNumber: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodType?: string;
  allergies?: string;
  chronicConditions?: string;
  userId: string;
  user?: User;
}

export interface Queue {
  id: string;
  queueNumber: string;
  status: QueueStatus;
  serviceType: ServiceType;
  department: string;
  priority: Priority;
  joinedAt: string;
  estimatedWaitTime?: number;
  serviceStartTime?: string;
  serviceEndTime?: string;
  actualServiceTime?: number;
  notes?: string;
  patient?: {
    user: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    };
  };
}

export interface DepartmentDisplay {
  department: string;
  currentlyServing?: {
    queueNumber: string;
    patientName: string;
    doctorName?: string;
    serviceStartTime: string;
    estimatedDuration?: number;
  };
  waitingPatients: Array<{
    queueNumber: string;
    patientName: string;
    priority: Priority;
    joinedAt: string;
    estimatedWaitTime: number;
  }>;
  statistics: {
    totalWaiting: number;
    currentlyInProgress: number;
    averageWaitTime: number;
    lastUpdated: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ApiError {
  error: string;
  message: string;
  details?: string[];
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; token: string; expiresIn: string }>>('/auth/login', { email, password }),
  
  register: (data: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  }) => api.post<ApiResponse<{ user: User }>>('/auth/register', data),
  
  getMe: () => api.get<ApiResponse<{ user: User }>>('/auth/me'),
  
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  
  createPatientProfile: (data: {
    cardNumber: string;
    medicalRecordNumber: string;
    dateOfBirth: string;
    gender: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    bloodType?: string;
    allergies?: string;
    chronicConditions?: string;
  }) => api.post<ApiResponse<{ patient: Patient }>>('/auth/create-patient-profile', data),
};

// Queue API
export const queueApi = {
  // Public endpoints
  request: (data: {
    cardNumber: string;
    department: string;
    serviceType: ServiceType;
    priority: Priority;
  }) => api.post<ApiResponse<{
    queue: Queue;
    patientInfo: { name: string; cardNumber: string; medicalRecordNumber: string };
    estimatedWaitTime: number;
    smsSent: boolean;
  }>>('/queues/request', data),
  
  getStatus: (queueNumber: string) =>
    api.get<ApiResponse<{
      queue: Queue;
      patient: { name: string; phoneNumber: string };
      position: number;
      estimatedWaitTime: number;
      departmentStatus: { waitingCount: number; inProgressCount: number; totalActive: number };
    }>>(`/queues/status/${queueNumber}`),
  
  searchByPhone: (phoneNumber: string) =>
    api.get<ApiResponse<{
      patient: { name: string; phoneNumber: string };
      activeQueues: Queue[];
      completedQueues: Queue[];
      totalQueues: number;
    }>>('/api/queue/search-by-phone', { params: { phoneNumber } }),
  
  // Public display
  getDisplay: () =>
    api.get<ApiResponse<{
      departments: DepartmentDisplay[];
      timestamp: string;
      totalDepartments: number;
    }>>('/api/queue/display'),
  
  search: (queueNumber: string) =>
    api.get<ApiResponse<{
      queue: Queue;
      patient: { name: string; phoneNumber: string };
      position: number;
      estimatedWaitTime: number;
      departmentStatus: { waitingCount: number; inProgressCount: number; totalActive: number };
      lastUpdated: string;
    }>>(`/api/queue/search/${queueNumber}`),
  
  // Authenticated endpoints
  getQueues: () => api.get<ApiResponse<{ queues: Queue[] }>>('/queues'),
  
  createQueue: (data: {
    patientId: string;
    serviceType: ServiceType;
    department: string;
    priority: Priority;
    notes?: string;
  }) => api.post<ApiResponse<{ queue: Queue }>>('/queues', data),
  
  updateStatus: (id: string, data: { status: QueueStatus; notes?: string }) =>
    api.put<ApiResponse<{ queue: Queue }>>(`/queues/${id}/status`, data),
  
  callNext: (queueId: string) =>
    api.put<ApiResponse<{ previousQueue?: Queue; nextQueue: Queue }>>(`/queues/${queueId}/next`),
  
  // Doctor-specific endpoints
  getActive: () =>
    api.get<ApiResponse<{
      department: string;
      currentPatient?: Queue;
      waitingPatients: Queue[];
      statistics: {
        totalWaiting: number;
        urgentCases: number;
        highPriority: number;
        averageWaitTime: number;
      };
      doctorId: string;
    }>>('/api/queue/active'),
  
  doctorCallNext: (department: string) =>
    api.patch<ApiResponse<{
      calledPatient: Queue;
      department: string;
      doctorId: string;
      smsSent: boolean;
    }>>('/api/queue/call-next', { department }),
  
  complete: (notes?: string) =>
    api.patch<ApiResponse<{
      completedPatient: Queue;
      actualServiceTime: number;
      doctorId: string;
      smsSent: boolean;
    }>>('/api/queue/complete', { notes }),
  
  getStatistics: (department: string, dateRange?: 'today' | 'week' | 'month') =>
    api.get<ApiResponse<{
      department: string;
      dateRange: string;
      statistics: Array<{ status: QueueStatus; count: number; avgServiceTime?: number }>;
      totalServed: number;
      doctorId: string;
    }>>('/api/queue/statistics', { params: { department, dateRange } }),
};

// User API
export const userApi = {
  getAll: () => api.get<ApiResponse<{ users: User[] }>>('/users'),
  getById: (id: string) => api.get<ApiResponse<{ user: User }>>(`/users/${id}`),
};

// Patient API
export const patientApi = {
  getAll: () => api.get<ApiResponse<{ patients: Patient[] }>>('/patients'),
  getById: (id: string) => api.get<ApiResponse<{ patient: Patient }>>(`/patients/${id}`),
};

// Notification API
export const notificationApi = {
  sendSms: (data: { phoneNumber: string; message: string; patientId?: string }) =>
    api.post<ApiResponse<{ phoneNumber: string; message: string; sentAt: string }>>('/notifications/sms', data),
  
  getHistory: () =>
    api.get<ApiResponse<{
      notifications: Array<{
        id: string;
        type: string;
        recipient: string;
        message: string;
        sentAt: string;
        status: string;
        patientId?: string;
      }>;
    }>>('/notifications/history'),
};

// Health check
export const healthApi = {
  check: () => api.get<{ status: string; message: string; timestamp: string }>('/health'),
};

export default api;
