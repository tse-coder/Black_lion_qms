import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import PublicDisplay from './pages/public/PublicDisplay';
import './assets/index.css';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

interface PublicRouteProps {
  children: ReactNode;
}

// Protected route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const rolePath = user?.role?.toLowerCase().replace(' ', '-') || 'patient';
    return <Navigate to={`/${rolePath}/dashboard`} />;
  }

  return children;
};

// Public route (redirect to dashboard if authenticated)
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthcare-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const rolePath = user?.role?.toLowerCase().replace(' ', '-') || 'patient';
    return <Navigate to={`/${rolePath}/dashboard`} />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/public-display" 
              element={<PublicDisplay />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/patient/dashboard" 
              element={
                <ProtectedRoute requiredRole="Patient">
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/doctor/dashboard" 
              element={
                <ProtectedRoute requiredRole="Doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/lab/dashboard" 
              element={
                <ProtectedRoute requiredRole="Lab Technician">
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Lab Dashboard</h1>
                      <p className="text-gray-600">Lab Technician dashboard coming soon...</p>
                    </div>
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute requiredRole="Admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
