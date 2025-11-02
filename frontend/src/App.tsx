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
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Nếu có Dashboard trong project, import vào:
import Dashboard from './pages/Dashboard'; // giữ nguyên theo project của bạn

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Questions = lazy(() => import('./pages/Questions'));
const QuestionForm = lazy(() => import('./pages/QuestionForm'));
const Quizzes = lazy(() => import('./pages/Quizzes'));
const QuizForm = lazy(() => import('./pages/QuizForm'));
const QuizTaking = lazy(() => import('./pages/QuizTaking'));
const MyAssignments = lazy(() => import('./pages/MyAssignments'));
const StudentResults = lazy(() => import('./pages/StudentResults'));
const TeacherAnalytics = lazy(() => import('./pages/TeacherAnalytics'));
const Profile = lazy(() => import('./pages/Profile'));
const NotificationSettings = lazy(() => import('./pages/NotificationSettings'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

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


const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Questions />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions/new"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <Layout>
                      <QuestionForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/questions/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <Layout>
                      <QuestionForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Quizzes />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/new"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <Layout>
                      <QuizForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quizzes/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <Layout>
                      <QuizForm />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
              <Route
                path="/my-assignments"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <MyAssignments />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
                element={
                  <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                    <Layout>
                      <TeacherAnalytics />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Profile />
                    </Layout>
                  </ProtectedRoute>
                }
              />
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
              <Route path="/unauthorized" element={<Unauthorized />} />
            </Routes>
          </Suspense>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

