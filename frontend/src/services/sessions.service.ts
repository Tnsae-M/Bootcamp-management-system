import apiClient from '../api/client';
import { Session } from '../types';

export const sessionsService = {
  getSessions: async (): Promise<Session[]> => {
    const res: any = await apiClient.get('/sessions');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.sessions || [];
  },

  getSessionsByBootcamp: async (bootcampId: string): Promise<Session[]> => {
    const res: any = await apiClient.get(`/sessions?bootcamp=${bootcampId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.sessions || [];
  },

  getSessionById: async (id: string): Promise<Session> => {
    const res: any = await apiClient.get(`/sessions/${id}`);
    return res.data ?? res;
  },

  createSession: async (data: any): Promise<Session> => {
    const res: any = await apiClient.post('/sessions', data);
    return res.data ?? res;
  },

  updateSessionStatus: async (id: string, status: string, note?: string): Promise<any> => {
    return apiClient.put(`/sessions/${id}/status`, { status, rejectionNote: note });
  },
};

