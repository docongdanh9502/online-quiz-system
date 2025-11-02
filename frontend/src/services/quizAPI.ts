import api from './api';

export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  timeLimit: number;
  questions: any[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuizListResponse {
  quizzes: Quiz[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const quizAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subject?: string;
  }): Promise<QuizListResponse> => {
    const response = await api.get('/quizzes', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Quiz> => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description?: string;
    subject: string;
    timeLimit: number;
    questions: string[];
  }): Promise<Quiz> => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Quiz>): Promise<Quiz> => {
    const response = await api.put(`/quizzes/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/quizzes/${id}`);
  },
};
