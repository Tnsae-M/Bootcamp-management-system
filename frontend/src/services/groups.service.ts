import apiClient from '../api/client';
import { Group } from '../types';

export const groupsService = {
  getGroupsByBootcamp: async (bootcampId: string): Promise<Group[]> => {
    const res: any = await apiClient.get(`/groups?bootcamp=${bootcampId}`);
    const data = res.data ?? res;
    return Array.isArray(data) ? data : data?.groups || [];
  },

  createGroup: async (data: any): Promise<Group> => {
    const res: any = await apiClient.post('/groups', data);
    return res.data ?? res;
  },

  addMember: async (groupId: string, userId: string): Promise<any> => {
    return apiClient.post(`/groups/${groupId}/members`, { userId });
  },

  removeMember: async (groupId: string, userId: string): Promise<any> => {
    return apiClient.delete(`/groups/${groupId}/members/${userId}`);
  },
};

