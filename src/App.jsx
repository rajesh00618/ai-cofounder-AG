import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const OnboardingPage = React.lazy(() => import('./pages/OnboardingPage'));
const GoalPage = React.lazy(() => import('./pages/GoalPage'));
const BusinessPlanningPage = React.lazy(() => import('./pages/BusinessPlanningPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
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
    api.getMe().catch((err) => {
      if (err.message.includes('Authentication required') || err.message.includes('Invalid token') || err.message.includes('Session expired')) logout();
    });
  }, [token, logout]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
      <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--color-bg-primary)',color:'var(--color-text-tertiary)',fontSize:'0.9375rem'}}>Loading...</div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/goal" element={<ProtectedRoute><GoalPage /></ProtectedRoute>} />
        <Route path="/business-planning" element={<ProtectedRoute><BusinessPlanningPage /></ProtectedRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard/*" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
