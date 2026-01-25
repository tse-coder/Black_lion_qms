import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { t } from '../utils/i18n';
import { Eye, EyeOff, Lock, Mail, User, Hospital } from 'lucide-react';
import type { LoginCredentials } from '../types/auth';

const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const user = await login(credentials);
      
      // Redirect based on user role
      switch (user.role) {
        case 'Patient':
          navigate('/patient/dashboard');
          break;
        case 'Doctor':
          navigate('/doctor/dashboard');
          break;
        case 'Lab Technician':
          navigate('/lab/dashboard');
          break;
        case 'Admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center">
            <img 
              src="/logo.jpg" 
              alt="Black Lion Hospital QMS" 
              className="h-full w-full object-contain rounded-lg"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('signIn')} to Black Lion QMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
            <Hospital className="h-4 w-4" />
            Digital Queue Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                {t('email')}
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue focus:z-10 sm:text-sm"
                placeholder={t('email')}
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                {t('password')}
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-10 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue focus:z-10 sm:text-sm"
                placeholder={t('password')}
                value={credentials.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="show-password"
                name="show-password"
                type="checkbox"
                className="h-4 w-4 text-healthcare-blue focus:ring-healthcare-blue border-gray-300 rounded"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
              />
              <label htmlFor="show-password" className="ml-2 block text-sm text-gray-900">
                Show password
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('loading')}...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {t('signIn')}
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-medium text-healthcare-blue hover:text-healthcare-dark"
              >
                {t('signUp')}
              </button>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Contact your administrator for login credentials
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
