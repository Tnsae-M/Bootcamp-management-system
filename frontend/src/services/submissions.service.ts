import apiClient from '../api/client';
import { Submission } from '../types';

export const submissionsService = {
  getSubmissions: async (params?: { taskId?: string; userId?: string }): Promise<Submission[]> => {
    const res: any = await apiClient.get('/submissions', { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.submissions || [];
  },

  submit: async (taskId: string, payload: any): Promise<Submission> => {
    const res: any = await apiClient.post(`/tasks/${taskId}/submit`, payload);
    return res.data ?? res;
  },

  grade: async (submissionId: string, payload: { score: number; feedback?: string; qualFlag?: string }): Promise<any> => {
    return apiClient.put(`/submissions/${submissionId}/grade`, payload);
  },
};

