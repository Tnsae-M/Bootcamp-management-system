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
    const params: any = {};
    if (sessionId) params.session = sessionId;
    if (bootcampId) params.bootcamp = bootcampId;
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

export const progressService = {
  getMyProgress: async (bootcampId: string): Promise<{
    attendanceRate: number;
    taskCompletionRate: number;
    avgScore: number;
    overallProgress: number;
  }> => {
    const res: any = await apiClient.get(`/progress/${bootcampId}/me`);
    return res.data ?? res;
  },
};

export const auditService = {
  getActivities: async (limit?: number): Promise<any[]> => {
    const res: any = await apiClient.get('/audit', { params: { limit: limit || 25 } });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.activities || [];
  },
};
