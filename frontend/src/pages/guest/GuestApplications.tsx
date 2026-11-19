import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsService } from '@/services/enrollments.service';
import { Enrollment } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function GuestApplications() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await enrollmentsService.getMyEnrollments();
      setEnrollments(data);
    } catch {
      toast.error('Failed to load application history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusHelper = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'STUDENT':
      case 'INDUCTED':
        return {
          icon: CheckCircle2,
          color: 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20',
          title: 'Application Accepted',
          message: 'Congratulations! You are officially enrolled as a Student in this bootcamp cohort.',
        };
      case 'APPLICANT_REJECTED':
      case 'NOT_INDUCTED':
      case 'DROPPED':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20',
          title: 'Not Accepted',
          message: 'Application was not selected for this cohort cycle. We encourage you to re-apply in the next cycle.',
        };
      case 'APPLICANT':
      default:
        return {
          icon: Clock,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
          title: 'Screening in Progress',
          message: 'Your application is currently under review by division leads and instructors.',
        };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Applications"
        description="Monitor the status of your bootcamp enrollments and screening outcomes"
        action={
          <Button size="sm" onClick={() => navigate('/dashboard/guest')}>
            Explore More Bootcamps
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No Applications Submitted"
          description="You have not submitted an application for any active bootcamp programs yet."
          action={{
            label: 'Browse Open Bootcamps',
            onClick: () => navigate('/dashboard/guest'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {enrollments.map((app) => {
            const bc = app.bootcamp;
            const helper = getStatusHelper(app.status);
            const StatusIcon = helper.icon;

            return (
              <Card key={app.id} className="border-[var(--border)] shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {bc?.division?.name && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-[var(--accent-foreground)]">
                            <Layers className="h-3 w-3" />
                            {bc.division.name}
                          </span>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {app.appliedAt ? `Applied on ${new Date(app.appliedAt).toLocaleDateString()}` : ''}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold">
                        {bc?.title || bc?.name || 'Bootcamp Cohort'}
                      </CardTitle>
                    </div>

                    <StatusBadge status={app.status} className="self-start sm:self-center text-xs px-3 py-1" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Status Banner */}
                  <div className={`flex items-start gap-3 rounded-lg border p-3 text-xs ${helper.color}`}>
                    <StatusIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">{helper.title}: </span>
                      <span>{helper.message}</span>
                    </div>
                  </div>

                  {/* Application Details Summary */}
                  {app.motivation && (
                    <div className="rounded-lg bg-[var(--muted)]/40 p-3 border border-[var(--border)] text-xs space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-[var(--foreground)]">
                        <FileText className="h-3.5 w-3.5 text-[var(--primary)]" />
                        Submitted Statement of Motivation
                      </div>
                      <p className="text-[var(--muted-foreground)] leading-relaxed italic">
                        "{app.motivation}"
                      </p>
                    </div>
                  )}

                  {/* Program Dates */}
                  {(bc?.startDate || bc?.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] pt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        Program Schedule: {bc?.startDate ? new Date(bc.startDate).toLocaleDateString() : 'TBA'}
                        {' — '}
                        {bc?.endDate ? new Date(bc.endDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
