import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard Pages
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/dashboard/HomePage';
import { LessonsPage } from './pages/dashboard/LessonsPage';
import { TestGeneratorPage } from './pages/dashboard/TestGeneratorPage';
import { FlashcardsPage } from './pages/dashboard/FlashcardsPage';
import { SummarizerPage } from './pages/dashboard/SummarizerPage';
import { PlannerPage } from './pages/dashboard/PlannerPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { GamificationPage } from './pages/dashboard/GamificationPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected Route Component
import { ProtectedRoute } from './components/ProtectedRoute';
import { NotAuthorized } from './pages/NotAuthorized';

function App() {
  const { isAuthenticated, user, loading, initializeAuth } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize Firebase auth listener
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<HomePage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="test-generator" element={<TestGeneratorPage />} />
          <Route path="flashcards" element={<FlashcardsPage />} />
          <Route path="summarizer" element={<SummarizerPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="gamification" element={<GamificationPage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          {/* Admin Routes */}
          <Route path="admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="/not-authorized" element={<NotAuthorized />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="/register" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;