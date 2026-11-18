import apiClient from '../api/client';
import { Division } from '../types';

export const divisionsService = {
  getDivisions: async (): Promise<Division[]> => {
    const res: any = await apiClient.get('/divisions');
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.divisions || [];
  },

  getDivisionById: async (id: string): Promise<Division> => {
    const res: any = await apiClient.get(`/divisions/${id}`);
    return res.data ?? res;
  },

  createDivision: async (data: any): Promise<Division> => {
    const res: any = await apiClient.post('/divisions', data);
    return res.data ?? res;
  },
};

