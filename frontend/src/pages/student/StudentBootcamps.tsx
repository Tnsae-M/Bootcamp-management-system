import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Layers,
  Award,
  Users,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsService } from '@/services/enrollments.service';
import { Enrollment } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentBootcamps() {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBootcamps();
  }, []);

  const loadBootcamps = async () => {
    setLoading(true);
    try {
      const data = await enrollmentsService.getMyEnrollments();
      // Filter for enrolled student or inducted
      const active = data.filter(
        (e) => e.status?.toUpperCase() === 'STUDENT' || e.status?.toUpperCase() === 'INDUCTED'
      );
      setEnrollments(active.length > 0 ? active : data);
    } catch {
      toast.error('Failed to load enrolled bootcamps');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Enrolled Bootcamps"
        description="Active specialization cohorts you are currently undertaking at CSEC-ASTU"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-10 w-full" />
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="No Active Enrollments"
          description="You are not currently enrolled as a student in any ongoing bootcamp."
          action={{
            label: 'Explore Available Bootcamps',
            onClick: () => navigate('/dashboard/guest'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enr) => {
            const bc = enr.bootcamp;
            return (
              <Card key={enr.id} className="flex flex-col justify-between border-[var(--border)] shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {bc?.division?.name && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-[var(--accent-foreground)]">
                        <Layers className="h-3 w-3" />
                        {bc.division.name}
                      </span>
                    )}
                    <StatusBadge status={enr.status} />
                  </div>

                  <CardTitle className="text-xl font-bold">
                    {bc?.title || bc?.name || 'Bootcamp Track'}
                  </CardTitle>

                  <CardDescription className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-1">
                    {bc?.description || 'Rigorous engineering training program with weekly lab drills and capstone milestones.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  {/* Timeline */}
                  {(bc?.startDate || bc?.endDate) && (
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {bc.startDate ? new Date(bc.startDate).toLocaleDateString() : 'TBA'}
                        {' — '}
                        {bc.endDate ? new Date(bc.endDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                  )}

                  {/* Criteria Weights */}
                  {bc && (
                    <div className="rounded-lg bg-[var(--muted)]/50 p-3 border border-[var(--border)] space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--foreground)]">
                        <Award className="h-3.5 w-3.5 text-amber-500" />
                        Induction Signal Allocation
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--muted-foreground)]">
                        <div>Attendance: <span className="font-semibold text-[var(--foreground)]">{bc.attendanceWeight}%</span></div>
                        <div>Tasks: <span className="font-semibold text-[var(--foreground)]">{bc.individualTaskWeight}%</span></div>
                        <div>Milestones: <span className="font-semibold text-[var(--foreground)]">{bc.groupMilestoneWeight}%</span></div>
                        <div>Peer Review: <span className="font-semibold text-[var(--foreground)]">{bc.peerReviewWeight}%</span></div>
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-3 border-t border-[var(--border)] flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate('/dashboard/student/sessions')}
                  >
                    View Sessions
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => navigate('/dashboard/student/progress')}
                  >
                    Track Progress
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
