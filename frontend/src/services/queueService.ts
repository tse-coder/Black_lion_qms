import api from './api';

interface Queue {
  id: string;
  name: string;
  department: string;
  nowServing?: string;
  nextTicket?: string;
  waitingCount?: number;
  avgWaitTime?: string;
}

interface Ticket {
  id: string;
  queueId: string;
  patientId: string;
  status: 'Waiting' | 'InProgress' | 'Complete' | 'Cancelled';
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

interface QueueStats {
  totalPatients: number;
  avgWaitTime: number;
  completedToday: number;
  currentlyWaiting: number;
}

interface PatientData {
  patientId: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const queueService = {
  // Get all queues
  async getQueues(): Promise<Queue[]> {
    const response = await api.get('/queues');
    return response.data;
  },

  // Get queue by ID
  async getQueueById(queueId: string): Promise<Queue> {
    const response = await api.get(`/queues/${queueId}`);
    return response.data;
  },

  // Get queue status
  async getQueueStatus(queueId: string): Promise<Queue> {
    const response = await api.get(`/queues/${queueId}/status`);
    return response.data;
  },

  // Join queue
  async joinQueue(queueId: string, patientData: PatientData): Promise<Ticket> {
    const response = await api.post(`/queues/${queueId}/join`, patientData);
    return response.data;
  },

  // Leave queue
  async leaveQueue(queueId: string, ticketId: string): Promise<void> {
    const response = await api.delete(`/queues/${queueId}/tickets/${ticketId}`);
    return response.data;
  },

  // Call next patient
  async callNextPatient(queueId: string): Promise<Ticket> {
    const response = await api.post(`/queues/${queueId}/next`);
    return response.data;
  },

  // Update ticket status
  async updateTicketStatus(queueId: string, ticketId: string, status: Ticket['status']): Promise<Ticket> {
    const response = await api.put(`/queues/${queueId}/tickets/${ticketId}`, { status });
    return response.data;
  },

  // Get patient's tickets
  async getPatientTickets(patientId: string): Promise<Ticket[]> {
    const response = await api.get(`/patients/${patientId}/tickets`);
    return response.data;
  },

  // Get today's queue statistics
  async getTodayStats(queueId: string): Promise<QueueStats> {
    const response = await api.get(`/queues/${queueId}/stats/today`);
    return response.data;
  },

  // Get queue history
  async getQueueHistory(queueId: string, date: string): Promise<any[]> {
    const response = await api.get(`/queues/${queueId}/history`, { params: { date } });
    return response.data;
  },

  // Create new queue
  async createQueue(queueData: Partial<Queue>): Promise<Queue> {
    const response = await api.post('/queues', queueData);
    return response.data;
  },

  // Update queue
  async updateQueue(queueId: string, queueData: Partial<Queue>): Promise<Queue> {
    const response = await api.put(`/queues/${queueId}`, queueData);
    return response.data;
  },

  // Delete queue
  async deleteQueue(queueId: string): Promise<void> {
    const response = await api.delete(`/queues/${queueId}`);
    return response.data;
  },
};
