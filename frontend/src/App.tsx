import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';

const Dashboard = () => {
  const { user } = require('./contexts/AuthContext').useAuth();
  return (
    <Layout>
      <div>
        <h1>Dashboard</h1>
        <p>Xin chào, {user?.name}!</p>
        <p>Email: {user?.email}</p>
        <p>Role: {user?.role}</p>
      </div>
    </Layout>
  );
};

const QuizzesPage = () => {
  return (
    <Layout>
      <div>
        <h1>Danh Sách Bài Thi</h1>
        <p>Trang này sẽ hiển thị danh sách bài thi</p>
      </div>
    </Layout>
  );
};

const QuestionsPage = () => {
  return (
    <Layout>
      <div>
        <h1>Quản Lý Câu Hỏi</h1>
        <p>Trang này chỉ dành cho teacher và admin</p>
      </div>
    </Layout>
  );
};

const ManageQuizzesPage = () => {
  return (
    <Layout>
      <div>
        <h1>Quản Lý Quiz</h1>
        <p>Trang này chỉ dành cho teacher và admin</p>
      </div>
    </Layout>
  );
};

const UsersPage = () => {
  return (
    <Layout>
      <div>
        <h1>Quản Lý Người Dùng</h1>
        <p>Trang này chỉ dành cho admin</p>
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <ProtectedRoute>
                <QuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-quizzes"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                <ManageQuizzesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
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
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
