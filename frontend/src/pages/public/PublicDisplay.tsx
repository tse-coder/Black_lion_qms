import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { queueService } from '../../services/queueService';

interface QueueDisplay {
  id: string;
  name: string;
  queueNumber: string;
  status: string;
  serviceType: string;
  department: string;
  nextTicket: string;
  waitingCount: number;
  avgWaitTime: number;
  nowServing?: {
    queueNumber: string;
    patientName: string;
    doctorName: string;
    serviceStartTime: string;
    estimatedDuration: number;
  };
  waitingPatients: Array<{
    queueNumber: string;
    patientName: string;
    priority: string;
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

const PublicDisplay: React.FC = () => {
  const { socket, connected } = useSocket();
  const [queues, setQueues] = useState<QueueDisplay[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch initial queue data
    const fetchQueues = async (): Promise<void> => {
      try {
        const data = await queueService.getQueues();
        setQueues(data as unknown as QueueDisplay[]);
      } catch (error) {
        console.error('Failed to fetch queues:', error);
      }
    };

    fetchQueues();

    // Listen for real-time updates
    if (socket) {
      socket.on('queue-update', (updatedQueue: QueueDisplay) => {
        setQueues(prev => 
          prev.map(queue => 
            queue.id === updatedQueue.id ? updatedQueue : queue
          )
        );
      });

      socket.on('ticket-called', (data: { queueNumber: string; patientName: string; message: string }) => {
        // Play sound or show notification when ticket is called
        console.log('Ticket called:', data);
      });
    }

    return () => {
      if (socket) {
        socket.off('queue-update');
        socket.off('ticket-called');
      }
    };
  }, [socket]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredQueues = selectedDepartment === 'all' 
    ? queues 
    : queues.filter(queue => queue.department === selectedDepartment);

  const departments = ['all', ...new Set(queues.map(q => q.department))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-healthcare-blue rounded-lg flex items-center justify-center text-white font-bold text-2xl mr-4">
            BLH
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Black Lion Hospital</h1>
            <p className="text-xl text-gray-600">Queue Management System</p>
          </div>
        </div>
        
        <div className="text-2xl font-semibold text-gray-700 mb-2">
          {formatDate(currentTime)}
        </div>
        <div className="text-3xl font-bold text-healthcare-blue">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Department Filter */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDepartment(dept)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-200 ${
                selectedDepartment === dept
                  ? 'bg-healthcare-blue text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {dept === 'all' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Display */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredQueues.map((queue) => (
            <div key={queue.id} className="card p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{queue.name}</h2>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{queue.department}</span>
                  <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
              </div>

              {/* Now Serving */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-green-800 mb-1">NOW SERVING</p>
                <p className="text-3xl font-bold text-green-900">
                  {typeof queue.nowServing === 'object' && queue.nowServing?.queueNumber ? queue.nowServing.queueNumber : '---'}
                </p>
              </div>

              {/* Next in Queue */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-800 mb-1">NEXT</p>
                <p className="text-2xl font-bold text-blue-900">
                  {queue.nextTicket || '---'}
                </p>
              </div>

              {/* Queue Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Waiting</p>
                  <p className="font-semibold text-gray-900">{queue.waitingCount || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Avg Wait</p>
                  <p className="font-semibold text-gray-900">{queue.avgWaitTime || '0 min'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Connection Status */}
        <div className="fixed bottom-4 right-4">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-md ${
            connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {connected ? 'Live Updates' : 'Connection Lost'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12 text-gray-600">
        <p className="text-sm">Please wait for your number to be called</p>
        <p className="text-xs mt-2">Have your ticket number ready when called</p>
      </div>
    </div>
  );
};

export default PublicDisplay;
