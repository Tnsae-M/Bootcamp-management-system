import { User } from './user';

export type TaskType = 'INDIVIDUAL' | 'GROUP_MILESTONE';
export type SubmissionType = 'FILE' | 'GITHUB_LINK' | 'BOTH';
export type SubmissionStatus = 'SUBMITTED' | 'GRADED' | 'RETURNED';
export type QualitativeFlag = 'EXCELLENT' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT';

export interface Task {
  id: string;
  _id?: string;
  bootcampId: string;
  type: TaskType | string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  submissionType: SubmissionType | string;
  deadline: string;
  maxScore: number;
  allowLateSubmission?: boolean;
  latePenaltyPercent?: number | null;
  allowResubmission?: boolean;
  peerReviewRequired?: boolean;
  milestoneNumber?: number | null;
  createdAt?: string;
}

export interface Submission {
  id: string;
  _id?: string;
  taskId: string;
  userId?: string | null;
  groupId?: string | null;
  version: number;
  fileUrl?: string | null;
  githubUrl?: string | null;
  status: SubmissionStatus | string;
  score?: number | null;
  feedback?: string | null;
  qualFlag?: QualitativeFlag | null;
  submittedAt?: string;
  gradedAt?: string | null;
  gradedBy?: string | null;
  task?: Task;
  user?: User;
}

