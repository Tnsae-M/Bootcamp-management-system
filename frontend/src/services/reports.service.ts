import apiClient from '../api/client';

export const reportsService = {
  getReports: async (): Promise<any[]> => {
    const res: any = await apiClient.get('/reports');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.reports || [];
  },

  createReport: async (payload: { title: string; content: string }): Promise<any> => {
    const res: any = await apiClient.post('/reports', payload);
    return res.data ?? res;
  },

  updateReport: async (id: string, payload: { title: string; content: string }): Promise<any> => {
    const res: any = await apiClient.put(`/reports/${id}`, payload);
    return res.data ?? res;
  },

  deleteReport: async (id: string): Promise<any> => {
    return apiClient.delete(`/reports/${id}`);
  },

  getAnalytics: async (): Promise<any> => {
    const res: any = await apiClient.get('/reports/analytics');
    return res.data ?? res;
  },
};

