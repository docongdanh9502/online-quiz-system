import api from './api';

export interface StudentResultsResponse {
  results: Array<{
    _id: string;
    quiz: {
      _id: string;
      title: string;
      subject: string;
      timeLimit: number;
    };
    assignment?: {
      _id: string;
      dueDate: string;
      status: string;
    };
    score: number;
    submittedAt?: string;
    timeSpent: number;
    createdAt: string;
  }>;
  summary: {
    totalQuizzes: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface QuizResultsResponse {
  quiz: {
    _id: string;
    title: string;
    subject: string;
    timeLimit: number;
  };
  results: Array<{
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
    };
    score: number;
    submittedAt?: string;
    timeSpent: number;
  }>;
  stats: {
    totalAttempts: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    completedCount: number;
  };
  questionAnalytics: Array<{
    _id: number;
    totalAnswers: number;
    correctAnswers: number;
  }>;
}

export interface TeacherAnalyticsResponse {
  stats: {
    totalQuizzes: number;
    totalAssignments: number;
    totalAttempts: number;
    completedAttempts: number;
    averageScore: number;
  };
  topQuizzes: Array<{
    _id: string;
    title: string;
    subject: string;
    totalAttempts: number;
    averageScore: number;
    completedAttempts: number;
  }>;
  subjectStats: Array<{
    _id: string;
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
  }>;
}

export interface AdminAnalyticsResponse {
  users: {
    total: number;
    students: number;
    teachers: number;
    admins: number;
  };
  quizzes: {
    total: number;
    questions: number;
  };
  assignments: {
    total: number;
  };
  results: {
    total: number;
    completed: number;
    averageScore: number;
  };
  subjectStats: Array<{
    _id: string;
    totalQuizzes: number;
  }>;
  recentActivity: Array<{
    _id: string;
    quiz: {
      _id: string;
      title: string;
      subject: string;
    };
    student: {
      _id: string;
      name: string;
      email: string;
    };
    score: number;
    createdAt: string;
  }>;
}

export const analyticsAPI = {
  getStudentResults: async (params?: {
    page?: number;
    limit?: number;
    quizId?: string;
    status?: string;
  }): Promise<StudentResultsResponse> => {
    const response = await api.get('/analytics/student/results', { params });
    return response.data;
  },

  getQuizResults: async (quizId: string): Promise<QuizResultsResponse> => {
    const response = await api.get(`/analytics/teacher/quiz/${quizId}/results`);
    return response.data;
  },

  getTeacherAnalytics: async (): Promise<TeacherAnalyticsResponse> => {
    const response = await api.get('/analytics/teacher/analytics');
    return response.data;
  },

  getAssignmentResults: async (assignmentId: string): Promise<any> => {
    const response = await api.get(`/analytics/teacher/assignment/${assignmentId}/results`);
    return response.data;
  },

  getAdminAnalytics: async (): Promise<AdminAnalyticsResponse> => {
    const response = await api.get('/analytics/admin/analytics');
    return response.data;
  },
};
