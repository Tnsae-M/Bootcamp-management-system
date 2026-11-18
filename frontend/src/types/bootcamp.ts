import { User } from './user';

export type BootcampStatus = 'DRAFT' | 'OPEN' | 'SCREENING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
export type EnrollmentStatus = 'APPLICANT' | 'APPLICANT_REJECTED' | 'STUDENT' | 'DROPPED' | 'INDUCTED' | 'NOT_INDUCTED';

export interface Division {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string | null;
  isArchived?: boolean;
  createdAt?: string;
}

export interface Bootcamp {
  id: string;
  _id?: string;
  divisionId: string;
  title: string;
  name?: string; // presentation compatibility
  description?: string | null;
  status: BootcampStatus | string;
  startDate?: string | null;
  endDate?: string | null;
  maxApplicants?: number | null;
  attendanceWeight: number;
  individualTaskWeight: number;
  groupMilestoneWeight: number;
  peerReviewWeight: number;
  division?: Division;
  instructors?: User[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Enrollment {
  id: string;
  _id?: string;
  userId: string;
  bootcampId: string;
  status: EnrollmentStatus | string;
  appliedAt?: string;
  motivation?: string | null;
  experience?: string | null;
  portfolioUrl?: string | null;
  user?: User;
  bootcamp?: Bootcamp;
}

