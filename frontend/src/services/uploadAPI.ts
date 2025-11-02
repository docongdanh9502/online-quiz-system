

import api from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export interface UploadResponse {
  message: string;
  avatar?: string;
  image?: string;
  quiz?: any;
}

export const uploadAPI = {
  uploadAvatar: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAvatar: async (): Promise<void> => {
    await api.delete('/upload/avatar');
  },

  uploadQuizImage: async (file: File, quizId?: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);
    if (quizId) {
      formData.append('quizId', quizId);
    }

    const response = await api.post('/upload/quiz-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteQuizImage: async (quizId: string): Promise<void> => {
    await api.delete(`/upload/quiz-image/${quizId}`);
  },

  getImageUrl: (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  },
};


