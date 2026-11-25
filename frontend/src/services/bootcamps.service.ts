import apiClient from '../api/client';
import { Bootcamp } from '../types';

export const bootcampsService = {
  getBootcamps: async (): Promise<Bootcamp[]> => {
    const res: any = await apiClient.get('/bootcamps');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.bootcamps || [];
  },

  getBootcampById: async (id: string): Promise<Bootcamp> => {
    const res: any = await apiClient.get(`/bootcamps/${id}`);
    return res.data ?? res;
  },

  getBootcampsByDivision: async (divisionId: string): Promise<Bootcamp[]> => {
    const res: any = await apiClient.get(`/divisions/${divisionId}/bootcamps`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.bootcamps || [];
  },

  createBootcamp: async (divisionId: string, data: any): Promise<Bootcamp> => {
    const res: any = await apiClient.post(`/bootcamps`, { ...data, divisionId });
    return res.data ?? res;
  },

  // C-1: no generic PUT /bootcamps/:id on backend — use updateStatus or updateWeights instead
  // updateBootcamp removed: split into updateStatus(id, status) and updateWeights(id, weights)

  updateStatus: async (id: string, status: string): Promise<Bootcamp> => {
    const res: any = await apiClient.put(`/bootcamps/${id}/status`, { status });
    return res.data ?? res;
  },

  updateWeights: async (id: string, weights: any): Promise<Bootcamp> => {
    const res: any = await apiClient.put(`/bootcamps/${id}/weights`, weights);
    return res.data ?? res;
  },

  applyForBootcamp: async (bootcampId: string, payload?: any): Promise<any> => {
    return apiClient.post('/enrollments/apply', { bootcampId, ...payload });
  },
};
