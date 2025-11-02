// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Questions from './pages/Questions';
import QuestionForm from './pages/QuestionForm';
import Quizzes from './pages/Quizzes';
import QuizForm from './pages/QuizForm';
import QuizTaking from './pages/QuizTaking';
import StudentResults from './pages/StudentResults';
import TeacherAnalytics from './pages/TeacherAnalytics';

// Nếu có Dashboard trong project, import vào:
import Dashboard from './pages/Dashboard'; // giữ nguyên theo project của bạn

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected: Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected: Profile (nếu bạn dùng) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Questions */}
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <Questions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/create"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <QuestionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <QuestionForm />
              </ProtectedRoute>
            }
          />

          {/* Quizzes */}
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/create"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <QuizForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <QuizForm />
              </ProtectedRoute>
            }
          />

          {/* Taking quiz (giữ Layout ở đây vì trang QuizTaking thường không tự bọc Layout) */}
          <Route
            path="/quiz/:quizId/take"
            element={
              <ProtectedRoute>
                <Layout>
                  <QuizTaking />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/assignment/:assignmentId/quiz/:quizId/take"
            element={
              <ProtectedRoute>
                <Layout>
                  <QuizTaking />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Results & Analytics (từ nhánh feature/frontend-results-analytics-ui) */}
          <Route
            path="/my-results"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentResults />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/analytics"
            element{
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <Layout>
                  <TeacherAnalytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          {/* 404: optional */}
          {/* <Route path="*" element={<Navigate to="/dashboard" />} /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationSettings from './pages/NotificationSettings';

// Wrap app với NotificationProvider
function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          {/* Routes */}
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

// Thêm route
<Route
  path="/settings/notifications"
  element={
    <ProtectedRoute>
      <Layout>
        <NotificationSettings />
      </Layout>
    </ProtectedRoute>
  }
/>



export default App;
