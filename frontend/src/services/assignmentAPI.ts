import api from './api';

export interface Assignment {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    subject: string;
    timeLimit: number;
  };
  assignedTo: {
    _id: string;
    name: string;
    email: string;
  };
  assignedBy: {
    _id: string;
    name: string;
    email: string;
  };
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListResponse {
  assignments: Assignment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const assignmentAPI = {
  create: async (data: {
    quizId: string;
    assignedTo: string;
    dueDate: string;
  }): Promise<Assignment> => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
    studentId?: string;
    quizId?: string;
    status?: string;
  }): Promise<AssignmentListResponse> => {
    const response = await api.get('/assignments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  getByStudent: async (studentId?: string): Promise<{ assignments: Assignment[] }> => {
    const url = studentId ? `/assignments/student/${studentId}` : '/assignments/student';
    const response = await api.get(url);
    return response.data;
  },

  update: async (id: string, data: Partial<Assignment>): Promise<Assignment> => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
};
