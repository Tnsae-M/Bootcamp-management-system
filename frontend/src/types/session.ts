import { User } from './user';

export type SessionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface Session {
  id: string;
  _id?: string;
  bootcampId: string;
  instructorId?: string;
  title: string;
  description?: string | null;
  location?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  durationH?: number;
  status: SessionStatus | string;
  instructor?: User;
  createdAt?: string;
}

export interface AttendanceCode {
  id: string;
  sessionId: string;
  code: string;
  windowMinutes: number;
  openedAt: string;
  expiresAt: string;
}

export interface AttendanceRecord {
  id: string;
  _id?: string;
  sessionId: string;
  userId: string;
  status: AttendanceStatus | string;
  submittedAt?: string;
  overrideNote?: string | null;
  user?: User;
  session?: Session;
}

