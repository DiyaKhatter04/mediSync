import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { requestNotificationPermission } from './utils/notifications';
import Layout    from './components/Layout';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Reminders from './pages/Reminders';
import Logs      from './pages/Logs';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading MediSync...</p>
        </div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index          element={<Dashboard />} />
        <Route path="medicines" element={<Medicines />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="logs"      element={<Logs />} />
      </Route>

      {/* Catch all — redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '10px',
              fontFamily: 'inherit',
            },
            success: {
              style: {
                background: '#E1F5EE',
                color: '#085041',
                border: '1px solid #5DCAA5',
              },
              iconTheme: {
                primary: '#0F6E56',
                secondary: '#E1F5EE',
              },
            },
            error: {
              style: {
                background: '#FCEBEB',
                color: '#A32D2D',
                border: '1px solid #F09595',
              },
              iconTheme: {
                primary: '#E24B4A',
                secondary: '#FCEBEB',
              },
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}