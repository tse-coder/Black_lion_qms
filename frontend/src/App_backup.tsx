import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import type { User } from './types/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Auth check failed:', error);
          authService.removeToken();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

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

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to={`/${user.role.toLowerCase().replace(' ', '-')}/dashboard`} />} 
        />
        <Route 
          path="/patient/dashboard" 
          element={user?.role === 'Patient' ? <Dashboard role="Patient" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/doctor/dashboard" 
          element={user?.role === 'Doctor' ? <Dashboard role="Doctor" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/lab/dashboard" 
          element={user?.role === 'Lab Technician' ? <Dashboard role="Lab Technician" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={user?.role === 'Admin' ? <Dashboard role="Admin" /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase().replace(' ', '-')}/dashboard` : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
