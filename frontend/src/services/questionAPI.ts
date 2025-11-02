import api from './api';

export interface Question {
  _id: string;
  title: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface QuestionListResponse {
  questions: Question[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const questionAPI = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    subject?: string;
    difficulty?: string;
  }): Promise<QuestionListResponse> => {
    const response = await api.get('/questions', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Question> => {
    const response = await api.get(`/questions/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    questionText: string;
    options: string[];
    correctAnswer: number;
    subject: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<Question> => {
    const response = await api.post('/questions', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Question>): Promise<Question> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },
};
