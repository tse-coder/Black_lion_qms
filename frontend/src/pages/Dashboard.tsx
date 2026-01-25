import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import type { User } from '../types/auth';

interface QuickAction {
  label: string;
  path: string;
  icon: string;
}

interface WelcomeMessage {
  title: string;
  subtitle: string;
  color: string;
}

interface DashboardProps {
  role: 'Patient' | 'Doctor' | 'Lab Technician' | 'Admin';
}

const Dashboard: React.FC<DashboardProps> = ({ role }) => {
  const navigate = useNavigate();

  const getWelcomeMessage = (): WelcomeMessage => {
    switch (role) {
      case 'Patient':
        return {
          title: 'Welcome to Patient Portal',
          subtitle: 'Manage your appointments and queue status',
          color: 'text-blue-600'
        };
      case 'Doctor':
        return {
          title: 'Welcome to Doctor Portal',
          subtitle: 'View patient queue and manage appointments',
          color: 'text-green-600'
        };
      case 'Lab Technician':
        return {
          title: 'Welcome to Lab Portal',
          subtitle: 'Manage lab tests and sample processing',
          color: 'text-purple-600'
        };
      case 'Admin':
        return {
          title: 'Welcome to Admin Portal',
          subtitle: 'System administration and reporting',
          color: 'text-red-600'
        };
      default:
        return {
          title: 'Welcome',
          subtitle: 'Queue Management System',
          color: 'text-gray-600'
        };
    }
  };

  const getQuickActions = (): QuickAction[] => {
    switch (role) {
      case 'Patient':
        return [
          { label: 'View Queue Status', path: '/patient/queue-status', icon: '📋' },
          { label: 'Book Appointment', path: '/patient/appointments', icon: '📅' },
          { label: 'Medical History', path: '/patient/history', icon: '📄' },
        ];
      case 'Doctor':
        return [
          { label: 'View Patients', path: '/doctor/patients', icon: '👥' },
          { label: 'Manage Queue', path: '/doctor/queue', icon: '📋' },
          { label: 'Schedule', path: '/doctor/schedule', icon: '📅' },
        ];
      case 'Lab Technician':
        return [
          { label: 'Test Queue', path: '/lab/queue', icon: '📋' },
          { label: 'Process Samples', path: '/lab/tests', icon: '🔬' },
          { label: 'Test Results', path: '/lab/results', icon: '📊' },
        ];
      case 'Admin':
        return [
          { label: 'User Management', path: '/admin/users', icon: '👥' },
          { label: 'Queue Management', path: '/admin/queues', icon: '📋' },
          { label: 'Reports', path: '/admin/reports', icon: '📊' },
          { label: 'System Settings', path: '/admin/settings', icon: '⚙️' },
        ];
      default:
        return [];
    }
  };

  const welcome = getWelcomeMessage();
  const quickActions = getQuickActions();

  const mockUser: User = {
    id: '1',
    email: 'user@example.com',
    role,
    firstName: 'Test',
    lastName: 'User',
    username: 'testuser',
    isActive: true
  };

  return (
    <Layout user={mockUser}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${welcome.color}`}>
            {welcome.title}
          </h1>
          <p className="mt-2 text-gray-600">
            {welcome.subtitle}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">248</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Wait Time</p>
                <p className="text-2xl font-semibold text-gray-900">15 min</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Queue</p>
                <p className="text-2xl font-semibold text-gray-900">32</p>
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="text-2xl mr-3">{action.icon}</span>
                <span className="text-left">
                  <p className="font-medium text-gray-900">{action.label}</p>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
