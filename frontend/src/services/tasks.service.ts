import apiClient from '../api/client';
import { Task } from '../types';

export const tasksService = {
  getTasks: async (bootcampId?: string, type?: string): Promise<Task[]> => {
    const params: any = {};
    if (bootcampId) params.bootcampId = bootcampId;
    if (type) params.type = type;
    const res: any = await apiClient.get('/tasks', { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.tasks || [];
  },

  getTaskById: async (id: string): Promise<Task> => {
    const res: any = await apiClient.get(`/tasks/${id}`);
    return res.data ?? res;
  },

  createTask: async (data: any): Promise<Task> => {
    const res: any = await apiClient.post('/tasks', data);
    return res.data ?? res;
  },

  deleteTask: async (id: string): Promise<any> => {
    return apiClient.delete(`/tasks/${id}`);
  },
};

