import api from './api';

export interface QuizResult {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    subject: string;
    timeLimit: number;
    questions: string[];
  };
  assignment?: string;
  student: string;
  answers: number[];
  score: number;
  startedAt: string;
  submittedAt?: string;
  timeSpent: number;
  createdAt: string;
}

export interface StartQuizResponse {
  quizResult: QuizResult;
  quiz: {
    _id: string;
    title: string;
    description?: string;
    subject: string;
    timeLimit: number;
    questions: Array<{
      _id: string;
      title: string;
      questionText: string;
      options: string[];
      correctAnswer: number;
      subject: string;
      difficulty: string;
    }>;
  };
  canContinue: boolean;
}

export interface QuizResultListResponse {
  results: QuizResult[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const quizResultAPI = {
  startQuiz: async (data: {
    quizId: string;
    assignmentId?: string;
  }): Promise<StartQuizResponse> => {
    const response = await api.post('/quiz-results/start', data);
    return response.data;
  },

  getResult: async (id: string): Promise<QuizResult> => {
    const response = await api.get(`/quiz-results/${id}`);
    return response.data;
  },

  saveAnswers: async (id: string, answers: number[]): Promise<QuizResult> => {
    const response = await api.put(`/quiz-results/${id}/save`, { answers });
    return response.data;
  },

  submitQuiz: async (id: string, answers: number[]): Promise<QuizResult> => {
    const response = await api.post(`/quiz-results/${id}/submit`, { answers });
    return response.data;
  },

  getMyResults: async (params?: {
    page?: number;
    limit?: number;
    quizId?: string;
  }): Promise<QuizResultListResponse> => {
    const response = await api.get('/quiz-results/my-results', { params });
    return response.data;
  },
};
