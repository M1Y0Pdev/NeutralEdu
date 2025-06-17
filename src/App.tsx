import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';

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
import { AdminPage } from './pages/admin/AdminPage';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
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
          {user?.role === 'admin' && (
            <Route path="admin" element={<AdminPage />} />
          )}
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;