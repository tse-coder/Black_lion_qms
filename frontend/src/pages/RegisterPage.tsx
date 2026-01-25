import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { useAuth } from '../hooks/useAuth';
import { t } from '../utils/i18n';
import { Eye, EyeOff, Lock, Mail, User, Phone, Users, Hospital, UserPlus, Building } from 'lucide-react';
import type { RegistrationCredentials } from '../types/auth';

const RegisterPage: React.FC = () => {
  const [credentials, setCredentials] = useState<RegistrationCredentials>({
    username: '',
    email: '',
    password: '',
    role: 'Patient',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!credentials.username || credentials.username.length < 3) {
      newErrors.username = t('usernameRequired');
    } else if (!/^[a-zA-Z0-9_]{3,30}$/.test(credentials.username)) {
      newErrors.username = 'Username must be 3-30 characters, alphanumeric only';
    }

    // Email validation
    if (!credentials.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!credentials.password || credentials.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (credentials.password !== confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }

    // First name validation
    if (!credentials.firstName || credentials.firstName.length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!credentials.lastName || credentials.lastName.length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone validation
    if (!credentials.phoneNumber) {
      newErrors.phoneNumber = t('phoneRequired');
    } else if (!/^\+251[9][0-9]{8}$/.test(credentials.phoneNumber)) {
      newErrors.phoneNumber = t('phoneInvalid');
    }

    // Role validation
    if (!credentials.role) {
      newErrors.role = t('roleRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Call the registration service
      const response = await authService.register(credentials);
      
      if (response.success) {
        // Show success message and redirect to login
        alert(t('registrationSuccess'));
        navigate('/login');
      } else {
        setErrors({
          general: response.message || 'Registration failed. Please try again.'
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrors({
        general: err.response?.data?.message || err.message || 'Registration failed. Please try again.'
      });
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
            {t('createAccount')} - Black Lion QMS
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 flex items-center justify-center gap-2">
            <Hospital className="h-4 w-4" />
            Digital Queue Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {errors.general}
            </div>
          )}

          {/* Username */}
          <div className="relative">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              {t('username')} *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={`appearance-none relative block w-full px-10 py-3 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('username')}
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('email')} *
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none relative block w-full px-10 py-3 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('email')}
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                {t('firstName')} *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('firstName')}
                value={credentials.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                {t('lastName')} *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('lastName')}
                value={credentials.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              {t('phoneNumber')} *
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
              placeholder="+2519xxxxxxxx"
              value={credentials.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              {t('role')} *
            </label>
            <select
              id="role"
              name="role"
              required
              className={`mt-1 block w-full px-3 py-2 border ${
                errors.role ? 'border-red-300' : 'border-gray-300'
              } bg-white text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
              value={credentials.role}
              onChange={handleChange}
            >
              <option value="">{t('selectRole')}</option>
              <option value="Patient">{t('patientRole')}</option>
              <option value="Doctor">{t('doctorRole')}</option>
              <option value="Lab Technician">{t('labTechnicianRole')}</option>
              <option value="Admin">{t('adminRole')}</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Password and Confirm Password */}
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t('password')} *
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('password')}
                value={credentials.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                {t('confirmPassword')} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-healthcare-blue focus:border-healthcare-blue sm:text-sm`}
                placeholder={t('confirmPassword')}
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Show Password Checkbox */}
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
              Show passwords
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('loading')}...
                </div>
              ) : (
                t('register')
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {t('alreadyHaveAccount')}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-healthcare-blue hover:text-healthcare-blue-dark"
              >
                {t('signIn')}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
