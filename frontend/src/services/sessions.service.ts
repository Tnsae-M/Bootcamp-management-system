import apiClient from '../api/client';
import { Session } from '../types';

export const sessionsService = {
  getSessions: async (): Promise<Session[]> => {
    const res: any = await apiClient.get('/sessions');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.sessions || [];
  },

  getSessionsByBootcamp: async (bootcampId: string): Promise<Session[]> => {
    const res: any = await apiClient.get(`/sessions/bootcamp/${bootcampId}`); // C-4 fix: path param, not query string
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.sessions || [];
  },

  getSessionById: async (id: string): Promise<Session> => {
    const res: any = await apiClient.get(`/sessions/${id}`);
    return res.data ?? res;
  },

  createSession: async (data: any): Promise<Session> => {
    const res: any = await apiClient.post('/sessions/propose', data); // C-2 fix: backend route is /propose
    return res.data ?? res;
  },

  // C-3 fix: backend has separate approve / reject / cancel routes — no generic /status route
  approveSession: async (id: string): Promise<any> => {
    return apiClient.put(`/sessions/${id}/approve`);
  },

  rejectSession: async (id: string, rejectionNote?: string): Promise<any> => {
    return apiClient.put(`/sessions/${id}/reject`, { rejectionNote });
  },

  cancelSession: async (id: string): Promise<any> => {
    return apiClient.put(`/sessions/${id}/cancel`);
  },
};

