import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ScheduleProvider } from './context/ScheduleContext';
import { FinanceProvider } from './context/FinanceContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SchedulePage from './pages/SchedulePage';
import FinancePage from './pages/FinancePage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const FullScreenLoader = () => (
  <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-[#a09db5] text-sm">Loading FinTrack…</p>
    </div>
  </div>
);

const AppProviders = ({ children }) => (
  <ScheduleProvider>
    <FinanceProvider>
      {children}
    </FinanceProvider>
  </ScheduleProvider>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/" element={
            <ProtectedRoute>
              <AppProviders>
                <AppLayout />
              </AppProviders>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="finance" element={<FinancePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
