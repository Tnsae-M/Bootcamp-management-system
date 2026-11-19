import apiClient from '../api/client';
import { Enrollment } from '../types';

export const enrollmentsService = {
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const res: any = await apiClient.get('/enrollments/me');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.enrollments || [];
  },

  getBootcampEnrollments: async (bootcampId: string, status?: string): Promise<Enrollment[]> => {
    const params = status ? { status } : {};
    const res: any = await apiClient.get(`/enrollments/bootcamp/${bootcampId}`, { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.enrollments || [];
  },

  createEnrollment: async (payload: {
    bootcampId: string;
    motivation?: string;
    experience?: string;
    portfolioUrl?: string;
  }): Promise<Enrollment> => {
    const res: any = await apiClient.post('/enrollments/apply', payload);
    return res.data ?? res;
  },

  screenApplicant: async (bootcampId: string, payload: { enrollmentId: string; status: string; note?: string }): Promise<any> => {
    return apiClient.post(`/bootcamps/${bootcampId}/screen`, payload);
  },
};
