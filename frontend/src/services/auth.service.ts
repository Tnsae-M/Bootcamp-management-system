import apiClient from '../api/client';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (credentials: { email: string; password: string }): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/login', credentials);
    return res.data || res;
  },

  register: async (userData: any): Promise<AuthResponse> => {
    const res: any = await apiClient.post('/auth/register', userData);
    return res.data || res;
  },

  getCurrentUser: async (): Promise<User> => {
    const res: any = await apiClient.get('/auth/me');
    return res.data || res;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('activeRole');
    }
  },

  verifyEmail: async (token: string): Promise<any> => {
    return apiClient.get(`/auth/verify-email/${token}`);
  },

  resendVerification: async (email: string): Promise<any> => {
    return apiClient.post('/auth/resend-verification', { email });
  },

  forgotPassword: async (email: string): Promise<any> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<any> => {
    return apiClient.post(`/auth/reset-password/${token}`, { password });
  },

  changePassword: async (passwords: { currentPassword: string; newPassword: string }): Promise<any> => {
    return apiClient.put('/auth/change-password', passwords);
  },
};

