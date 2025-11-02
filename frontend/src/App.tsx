import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Questions from './pages/Questions';

// ... (giữ nguyên các components khác)

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
            path="/questions"
            element={
              <ProtectedRoute>
                <Questions />
              </ProtectedRoute>
            }
          />
          {/* ... (giữ nguyên các routes khác) */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

File: frontend/src/services/api.ts (nếu chưa có error handling)

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};
import Quizzes from './pages/Quizzes';

// ... (trong Routes)
<Route
  path="/quizzes"
  element={
    <ProtectedRoute>
      <Quizzes />
    </ProtectedRoute>
  }
/>


export default api;
import QuestionForm from './pages/QuestionForm';

// ... (trong Routes)
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

