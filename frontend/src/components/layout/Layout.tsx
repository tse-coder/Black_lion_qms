import React, { type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Activity,
  ClipboardList,
  TestTube,
  Shield
} from 'lucide-react';
import type { User } from '../../types/auth';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactElement<{ className?: string }>;
}

interface LayoutProps {
  children: ReactNode;
  user: User | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authService.removeToken();
      navigate('/login');
    }
  };

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    switch (user.role) {
      case 'Patient':
        return [
          { path: '/patient/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { path: '/patient/queue-status', label: 'Queue Status', icon: <ClipboardList className="h-5 w-5" /> },
          { path: '/patient/appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" /> },
        ];
      case 'Doctor':
        return [
          { path: '/doctor/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { path: '/doctor/patients', label: 'Patients', icon: <Users className="h-5 w-5" /> },
          { path: '/doctor/appointments', label: 'Appointments', icon: <Calendar className="h-5 w-5" /> },
          { path: '/doctor/prescriptions', label: 'Prescriptions', icon: <FileText className="h-5 w-5" /> },
        ];
      case 'Lab Technician':
        return [
          { path: '/lab/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { path: '/lab/tests', label: 'Tests', icon: <TestTube className="h-5 w-5" /> },
          { path: '/lab/results', label: 'Results', icon: <FileText className="h-5 w-5" /> },
        ];
      case 'Admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
          { path: '/admin/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
          { path: '/admin/queues', label: 'Queue Management', icon: <ClipboardList className="h-5 w-5" /> },
          { path: '/admin/reports', label: 'Reports', icon: <FileText className="h-5 w-5" /> },
          { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
        ];
      default:
        return [{ path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> }];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.jpg" 
              alt="Black Lion Hospital QMS" 
              className="w-10 h-10 object-contain rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Black Lion</h1>
              <p className="text-sm text-gray-500">Queue Management</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {user?.role} Portal
            </p>
          </div>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'bg-healthcare-blue text-white border-r-4 border-healthcare-blue'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                🔔
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                ⚙️
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
