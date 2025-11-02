import api from './api';

export interface Notification {
  _id: string;
  type: 'assignment_created' | 'assignment_reminder' | 'quiz_submitted' | 'assignment_expired';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  emailAssignmentCreated: boolean;
  emailAssignmentReminder: boolean;
  emailQuizSubmitted: boolean;
  emailAssignmentExpired: boolean;
}

export const notificationAPI = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put('/notifications/read-all');
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await api.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (preferences: NotificationPreferences): Promise<NotificationPreferences> => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
  },
};
