import apiClient from '../api/client';
import { AttendanceRecord } from '../types';

export const attendanceService = {
  openWindow: async (payload: { sessionId: string; windowMinutes?: number }): Promise<any> => {
    return apiClient.post('/attendance/open-window', payload);
  },

  submitCode: async (payload: { code: string; sessionId?: string }): Promise<any> => {
    return apiClient.post('/attendance/submit', payload);
  },

  // C-5 fix: no GET /attendance root — route to /me or /session/:sessionId based on params
  getMyAttendance: async (): Promise<AttendanceRecord[]> => {
    const res: any = await apiClient.get('/attendance/me');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.records || [];
  },

  getSessionAttendance: async (sessionId: string): Promise<AttendanceRecord[]> => {
    const res: any = await apiClient.get(`/attendance/session/${sessionId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.records || [];
  },

  // C-6 fix: method is POST (not PUT) and path is /override (not /:id/override)
  overrideAttendance: async (payload: { sessionId: string; userId: string; status: string; overrideNote?: string }): Promise<any> => {
    return apiClient.post('/attendance/override', payload);
  },
};

