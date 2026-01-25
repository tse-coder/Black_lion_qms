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

interface Appointment {
  id: number;
  patient: string;
  time: string;
  status: 'completed' | 'in-progress' | 'waiting';
  type: 'Follow-up' | 'Consultation' | 'New Patient';
}

const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions: QuickAction[] = [
    { 
      label: t('patientList'), 
      path: '/doctor/patients', 
      icon: '👥',
      description: 'View and manage patient records'
    },
    { 
      label: t('todaysAppointments'), 
      path: '/doctor/appointments', 
      icon: '📅',
      description: 'See today\'s scheduled appointments'
    },
    { 
      label: 'Manage Queue', 
      path: '/doctor/queue', 
      icon: '📋',
      description: 'Call next patient from queue'
    },
    { 
      label: t('prescribeMedication'), 
      path: '/doctor/prescriptions', 
      icon: '💊',
      description: 'Write and manage prescriptions'
    },
  ];

  const stats: Stat[] = [
    { label: 'Patients Today', value: '24', change: '+3 from yesterday', color: 'text-green-600' },
    { label: 'In Queue', value: '8', change: '2 waiting > 15min', color: 'text-blue-600' },
    { label: 'Completed', value: '16', change: 'On track', color: 'text-purple-600' },
    { label: 'Avg Consult Time', value: '12 min', change: '-2 min', color: 'text-orange-600' },
  ];

  const todaysAppointments: Appointment[] = [
    { id: 1, patient: 'John Doe', time: '09:00 AM', status: 'completed', type: 'Follow-up' },
    { id: 2, patient: 'Jane Smith', time: '09:30 AM', status: 'completed', type: 'Consultation' },
    { id: 3, patient: 'Mike Johnson', time: '10:00 AM', status: 'in-progress', type: 'New Patient' },
    { id: 4, patient: 'Sarah Williams', time: '10:30 AM', status: 'waiting', type: 'Follow-up' },
    { id: 5, patient: 'Robert Brown', time: '11:00 AM', status: 'waiting', type: 'Consultation' },
  ];

  const getStatusColor = (status: Appointment['status']): string => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout user={user}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-green-600">
            {t('welcome')}, Dr. {user?.lastName}!
          </h1>
          <p className="mt-2 text-gray-600">
            {t('doctor')} Portal - Patient care and queue management
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2 card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('todaysAppointments')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todaysAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.patient}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

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
        </div>
      </div>
    </Layout>
  );
};

export default DoctorDashboard;
