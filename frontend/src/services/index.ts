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
    const list = await notificationsService.getNotifications();
    const unread = list.filter((n: any) => !n.isRead && !n.read);
    return Promise.all(unread.map((n: any) => notificationsService.markAsRead(n.id)));
  },
};

export const feedbackService = {
  getFeedback: async (sessionId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/feedback/session/${sessionId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.feedbacks || [];
  },

  submitFeedback: async (sessionId: string, payload: { rating: number; comment?: string }): Promise<any> => {
    return apiClient.post('/feedback/session', { sessionId, ...payload });
  },

  submitPeerReview: async (payload: { submissionId: string; revieweeId: string; rating: number; comment?: string }): Promise<any> => {
    return apiClient.post('/feedback/peer-review', payload);
  },
};

export const resourcesService = {
  getResources: async (sessionId?: string): Promise<any[]> => {
    if (!sessionId) return [];
    const res: any = await apiClient.get(`/resources/session/${sessionId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.resources || [];
  },

  uploadResource: async (formData: FormData, sessionId?: string): Promise<any> => {
    const targetSessionId = sessionId || (formData.get('sessionId') as string);
    if (!targetSessionId) {
      throw new Error('sessionId is required to upload a resource');
    }
    return apiClient.post(`/resources/session/${targetSessionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  downloadResource: async (id: string): Promise<any> => {
    return apiClient.get(`/resources/${id}/download`, { responseType: 'blob' });
  },
};

export const projectsService = {
  getProjectsByBootcamp: async (bootcampId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/projects/bootcamp/${bootcampId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.projects || [];
  },

  createProject: async (bootcampId: string, payload: any): Promise<any> => {
    return apiClient.post('/projects', { bootcampId, ...payload });
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

export const inductionService = {
  getLeaderboard: async (bootcampId: string): Promise<any[]> => {
    const res: any = await apiClient.get(`/induction/leaderboard/${bootcampId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.leaderboard || [];
  },

  recordDecision: async (payload: { enrollmentId: string; decision: string; note?: string }): Promise<any> => {
    return apiClient.post('/induction/decide', payload);
  },
};
