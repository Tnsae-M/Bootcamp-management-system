import apiClient from '../api/client';
import { User } from '../types';

export const usersService = {
  getUsers: async (role?: string): Promise<User[]> => {
    const params = role ? { role } : {};
    const res: any = await apiClient.get('/users', { params });
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.users || [];
  },

  getUserById: async (id: string): Promise<User> => {
    const res: any = await apiClient.get(`/users/${id}`);
    return res.data ?? res;
  },

  adminResetPassword: async (userId: string, newPassword: string): Promise<any> => {
    return apiClient.put(`/auth/admin/reset-password/${userId}`, { newPassword });
  },

  updateRoles: async (userId: string, roles: string[]): Promise<any> => {
    return apiClient.put(`/users/${userId}/roles`, { roles });
  },
};

