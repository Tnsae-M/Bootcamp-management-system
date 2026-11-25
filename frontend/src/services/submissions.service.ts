import apiClient from '../api/client';
import { Submission } from '../types';

export const submissionsService = {
  // C-7 fix: no GET /submissions root — split into /me and /task/:taskId
  getMySubmissions: async (): Promise<Submission[]> => {
    const res: any = await apiClient.get('/submissions/me');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.submissions || [];
  },

  getSubmissionsByTask: async (taskId: string): Promise<Submission[]> => {
    const res: any = await apiClient.get(`/submissions/task/${taskId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.submissions || [];
  },

  // C-8 fix: backend route is POST /submissions with taskId in body (not POST /tasks/:taskId/submit)
  submit: async (taskId: string, payload: any): Promise<Submission> => {
    const res: any = await apiClient.post('/submissions', { taskId, ...payload });
    return res.data ?? res;
  },

  // C-9 fix: method is POST not PUT
  grade: async (submissionId: string, payload: { score: number; feedback?: string; qualFlag?: string }): Promise<any> => {
    return apiClient.post(`/submissions/${submissionId}/grade`, payload);
  },

  returnSubmission: async (submissionId: string, payload: { feedback: string }): Promise<any> => {
    return apiClient.post(`/submissions/${submissionId}/return`, payload);
  },
};

