import apiClient from '../api/client';
import { Enrollment } from '../types';

export const enrollmentsService = {
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const res: any = await apiClient.get('/enrollments/me');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.enrollments || [];
  },

  getBootcampEnrollments: async (bootcampId: string): Promise<Enrollment[]> => {
    const res: any = await apiClient.get(`/bootcamps/${bootcampId}/enrollments`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.enrollments || [];
  },

  createEnrollment: async (payload: { bootcampId: string; divisionId?: string }): Promise<Enrollment> => {
    const res: any = await apiClient.post(`/bootcamps/${payload.bootcampId}/apply`, payload);
    return res.data ?? res;
  },

  screenApplicant: async (enrollmentId: string, status: string, note?: string): Promise<any> => {
    return apiClient.put(`/enrollments/${enrollmentId}/screen`, { status, note });
  },
};

