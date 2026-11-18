import apiClient from '../api/client';

export const notificationsService = {
  getNotifications: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/notifications');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.notifications || [];
  },

  markAsRead: async (id: string): Promise<any> => {
    return apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<any> => {
    return apiClient.put('/notifications/read-all');
  },
};

export const feedbackService = {
  getFeedback: async (sessionId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/sessions/${sessionId}/feedback`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.feedbacks || [];
  },

  submitFeedback: async (sessionId: string, payload: { rating: number; comment?: string }): Promise<any> => {
    return apiClient.post(`/sessions/${sessionId}/feedback`, payload);
  },
};

export const resourcesService = {
  getResources: async (sessionId?: string, bootcampId?: string): Promise<any[]> => {
    const params = { session: sessionId, bootcamp: bootcampId };
    const res: any = await apiClient.get('/resources', { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.resources || [];
  },

  uploadResource: async (formData: FormData): Promise<any> => {
    return apiClient.post('/resources', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const projectsService = {
  getProjectsByBootcamp: async (bootcampId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/bootcamps/${bootcampId}/projects`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.projects || [];
  },

  createProject: async (bootcampId: string, payload: any): Promise<any> => {
    return apiClient.post(`/bootcamps/${bootcampId}/projects`, payload);
  },
};

