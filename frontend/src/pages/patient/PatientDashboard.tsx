import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../utils/i18n';

interface QuickAction {
  label: string;
  path: string;
  icon: string;
  description: string;
}

interface Stat {
  label: string;
  value: string;
  change: string;
  color: string;
}

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions: QuickAction[] = [
    { 
      label: t('queueStatus'), 
      path: '/patient/queue-status', 
      icon: '📋',
      description: 'Check your current position in queue'
    },
    { 
      label: t('bookAppointment'), 
      path: '/patient/appointments', 
      icon: '📅',
      description: 'Schedule a new appointment'
    },
    { 
      label: t('medicalHistory'), 
      path: '/patient/history', 
      icon: '📄',
      description: 'View your medical records'
    },
    { 
      label: t('testResults'), 
      path: '/patient/results', 
      icon: '🔬',
      description: 'Check your test results'
    },
  ];

  const stats: Stat[] = [
    { label: 'Current Queue', value: 'A-23', change: '+2 positions', color: 'text-blue-600' },
    { label: 'Wait Time', value: '15 min', change: '-5 min', color: 'text-green-600' },
    { label: 'Next Appointment', value: 'Today, 2:30 PM', change: 'In 2 hours', color: 'text-purple-600' },
    { label: 'Pending Tests', value: '2', change: 'Lab results ready', color: 'text-orange-600' },
  ];

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600">
            {t('welcome')}, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {t('patient')} Portal - Manage your healthcare journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-left"
                >
                  <span className="text-2xl mr-4">{action.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{action.label}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Appointment Completed</p>
                  <p className="text-xs text-gray-500">Dr. Sarah Johnson - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lab Results Available</p>
                  <p className="text-xs text-gray-500">Blood Test - Yesterday</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Prescription Refill Ready</p>
                  <p className="text-xs text-gray-500">Pharmacy - 2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;
