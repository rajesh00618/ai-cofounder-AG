import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import GoalPage from './pages/GoalPage';
import BusinessPlanningPage from './pages/BusinessPlanningPage';
import DashboardPage from './pages/DashboardPage';
import { useAuthStore } from './store/authStore';
import { api } from './utils/api';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/design-system.css';

export default function App() {
  const token = useAuthStore(s => s.token);
  const logout = useAuthStore(s => s.logout);

  useEffect(() => {
    if (!token) return;
    api.getMe().catch(() => logout());
  }, []);

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/goal" element={<ProtectedRoute><GoalPage /></ProtectedRoute>} />
        <Route path="/business-planning" element={<ProtectedRoute><BusinessPlanningPage /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
