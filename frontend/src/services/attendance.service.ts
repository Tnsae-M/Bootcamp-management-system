import apiClient from '../api/client';
import { AttendanceRecord } from '../types';

export const attendanceService = {
  openWindow: async (payload: { sessionId: string; windowMinutes?: number }): Promise<any> => {
    return apiClient.post('/attendance/open-window', payload);
  },

  submitCode: async (payload: { code: string; sessionId?: string }): Promise<any> => {
    return apiClient.post('/attendance/submit', payload);
  },

  getRecords: async (params?: { sessionId?: string; bootcampId?: string }): Promise<AttendanceRecord[]> => {
    const res: any = await apiClient.get('/attendance', { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.records || [];
  },

  overrideAttendance: async (id: string, status: string, note?: string): Promise<any> => {
    return apiClient.put(`/attendance/${id}/override`, { status, overrideNote: note });
  },
};

