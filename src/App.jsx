import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import GoalPage from './pages/GoalPage';
import BusinessPlanningPage from './pages/BusinessPlanningPage';
import DashboardPage from './pages/DashboardPage';
import './styles/design-system.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/goal" element={<GoalPage />} />
        <Route path="/business-planning" element={<BusinessPlanningPage />} />
        <Route path="/dashboard/*" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
