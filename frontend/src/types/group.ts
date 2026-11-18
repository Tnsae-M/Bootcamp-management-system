import { User } from './user';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  isLeader: boolean;
  joinedAt?: string;
  user?: User;
}

export interface Group {
  id: string;
  _id?: string;
  bootcampId: string;
  name: string;
  mentor?: User | null;
  members?: GroupMember[];
  createdAt?: string;
}

