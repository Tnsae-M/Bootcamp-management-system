import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import type { BadgeProps } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// --- Status → variant mapping ---
type BadgeVariant = BadgeProps['variant'];

interface StatusConfig {
  variant: BadgeVariant;
  label?: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Bootcamp lifecycle
  DRAFT:      { variant: 'outline',     label: 'Draft' },
  OPEN:       { variant: 'info',        label: 'Open' },
  SCREENING:  { variant: 'warning',     label: 'Screening' },
  ACTIVE:     { variant: 'success',     label: 'Active' },
  COMPLETED:  { variant: 'secondary',   label: 'Completed' },
  ARCHIVED:   { variant: 'outline',     label: 'Archived' },

  // Enrollment
  APPLICANT:           { variant: 'info',        label: 'Applicant' },
  APPLICANT_REJECTED:  { variant: 'destructive',  label: 'Rejected' },
  STUDENT:             { variant: 'success',      label: 'Student' },
  DROPPED:             { variant: 'destructive',  label: 'Dropped' },
  INDUCTED:            { variant: 'success',      label: 'Inducted' },
  NOT_INDUCTED:        { variant: 'warning',      label: 'Not Inducted' },

  // Attendance
  PRESENT:   { variant: 'success',     label: 'Present' },
  LATE:      { variant: 'warning',     label: 'Late' },
  ABSENT:    { variant: 'destructive', label: 'Absent' },
  EXCUSED:   { variant: 'secondary',   label: 'Excused' },

  // Session
  PENDING:    { variant: 'warning',     label: 'Pending' },
  APPROVED:   { variant: 'success',     label: 'Approved' },
  REJECTED:   { variant: 'destructive', label: 'Rejected' },
  CANCELLED:  { variant: 'outline',     label: 'Cancelled' },

  // Roles (display)
  SUPER_ADMIN:     { variant: 'info',      label: 'Super Admin' },
  DIVISION_ADMIN:  { variant: 'info',      label: 'Division Admin' },
  INSTRUCTOR:      { variant: 'secondary', label: 'Instructor' },
  STUDENT_ROLE:    { variant: 'secondary', label: 'Student' },
  GUEST:           { variant: 'outline',   label: 'Guest' },

  // Submission / Task
  SUBMITTED: { variant: 'info',      label: 'Submitted' },
  GRADED:    { variant: 'success',   label: 'Graded' },
  OVERDUE:   { variant: 'destructive', label: 'Overdue' },
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_MAP[status?.toUpperCase()] ?? {
    variant: 'outline' as BadgeVariant,
    label: status,
  };

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label ?? status}
    </Badge>
  );
}

export { StatusBadge };

