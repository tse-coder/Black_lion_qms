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

interface SystemStat {
  label: string;
  value: string;
  change: string;
  color: string;
}

interface ActivityItem {
  action: string;
  user: string;
  time: string;
  type: 'user' | 'system' | 'report';
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions: QuickAction[] = [
    { 
      label: t('userManagement'), 
      path: '/admin/users', 
      icon: '👥',
      description: 'Manage user accounts and permissions'
    },
    { 
      label: 'Queue Management', 
      path: '/admin/queues', 
      icon: '📋',
      description: 'Configure and monitor all queues'
    },
    { 
      label: t('reports'), 
      path: '/admin/reports', 
      icon: '📊',
      description: 'Generate system reports and analytics'
    },
    { 
      label: t('systemSettings'), 
      path: '/admin/settings', 
      icon: '⚙️',
      description: 'Configure system parameters'
    },
  ];

  const systemStats: SystemStat[] = [
    { label: 'Total Users', value: '1,248', change: '+12 this week', color: 'text-blue-600' },
    { label: 'Active Queues', value: '8', change: 'All operational', color: 'text-green-600' },
    { label: 'Patients Today', value: '342', change: '+15% from avg', color: 'text-purple-600' },
    { label: 'System Health', value: '98%', change: 'All systems normal', color: 'text-green-600' },
  ];

  const recentActivity: ActivityItem[] = [
    { action: 'New user registered', user: 'Dr. Alice Chen', time: '5 minutes ago', type: 'user' },
    { action: 'Queue configuration updated', user: 'Admin', time: '1 hour ago', type: 'system' },
    { action: 'Report generated', user: 'Dr. John Smith', time: '2 hours ago', type: 'report' },
    { action: 'System backup completed', user: 'System', time: '4 hours ago', type: 'system' },
    { action: 'User role changed', user: 'Admin', time: '6 hours ago', type: 'user' },
  ];

  const getActivityIcon = (type: ActivityItem['type']): string => {
    switch (type) {
      case 'user': return '👤';
      case 'system': return '⚙️';
      case 'report': return '📊';
      default: return '📋';
    }
  };

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-red-600">
            {t('welcome')}, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {t('admin')} Portal - System administration and oversight
          </p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemStats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
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

          {/* Recent Activity */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <span className="text-xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">by {activity.user} • {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">General Practice</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Laboratory</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Radiology</span>
                </div>
                <span className="text-sm text-yellow-600">High Load</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Pharmacy</span>
                </div>
                <span className="text-sm text-green-600">Operational</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Average Wait Time</span>
                  <span className="text-sm text-gray-500">12 min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Patient Satisfaction</span>
                  <span className="text-sm text-gray-500">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">System Efficiency</span>
                  <span className="text-sm text-gray-500">88%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
