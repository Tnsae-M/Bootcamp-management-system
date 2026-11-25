import apiClient from '../api/client';
import { Group } from '../types';

export const groupsService = {
  // C-10 fix: backend expects path param /groups/bootcamp/:bootcampId, not query string
  getGroupsByBootcamp: async (bootcampId: string): Promise<Group[]> => {
    const res: any = await apiClient.get(`/groups/bootcamp/${bootcampId}`);
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

  // C-11: no backend DELETE /groups/:id/members/:userId route exists — omitted until backend adds it
  // removeMember: async (groupId: string, userId: string) => { ... }
};

