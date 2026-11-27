import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  UserCheck,
  Plus,
  KeyRound,
  ArrowRight,
  Clock,
  Award,
  Layers,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { sessionsService } from '@/services/sessions.service';
import { tasksService } from '@/services/tasks.service';
import { submissionsService } from '@/services/submissions.service';
import { groupsService } from '@/services/groups.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { Session, Task, Submission, Bootcamp } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatGrid, StatItem } from '@/components/common/StatGrid';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorDashboard() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstructorHub();
  }, []);

  const loadInstructorHub = async () => {
    setLoading(true);
    try {
      const [sessList, taskList, bcList] = await Promise.all([
        sessionsService.getSessions().catch(() => []),
        tasksService.getTasks().catch(() => []),
        bootcampsService.getBootcamps().catch(() => []),
      ]);
      const subArrays = await Promise.all(
        taskList.slice(0, 10).map((t) => submissionsService.getSubmissionsByTask(t.id).catch(() => []))
      );
      setSessions(sessList);
      setTasks(taskList);
      setSubmissions(subArrays.flat());
      setBootcamps(bcList);
    } catch {
      toast.error('Failed to load instructor metrics');
    } finally {
      setLoading(false);
    }
  };

  const pendingGrading = submissions.filter((s) => s.status?.toUpperCase() !== 'GRADED');

  const stats: StatItem[] = [
    {
      title: 'Scheduled Sessions',
      value: sessions.length,
      icon: <FolderKanban className="h-5 w-5 text-blue-500" />,
      description: 'Lectures and practical labs',
    },
    {
      title: 'Active Tasks',
      value: tasks.length,
      icon: <CheckSquare className="h-5 w-5 text-indigo-500" />,
      description: 'Problem sets and milestones',
    },
    {
      title: 'Pending Grading',
      value: pendingGrading.length,
      icon: <FileText className="h-5 w-5 text-amber-500" />,
      description: 'Submissions awaiting review',
    },
    {
      title: 'Teaching Cohorts',
      value: bootcamps.length,
      icon: <Layers className="h-5 w-5 text-green-500" />,
      description: 'Active division tracks',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructor Teaching Hub"
        description="Deliver curricula, manage time-sensitive attendance PINs, and review lab submissions"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/dashboard/instructor/sessions')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Session
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/instructor/tasks')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Task
            </Button>
          </div>
        }
      />

      <StatGrid stats={stats} cols={4} />

      {/* Main Row: Recent Sessions + Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sessions Section */}
        <div className="lg:col-span-6">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Session Delivery & Attendance</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Launch attendance PINs and monitor student presence
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/dashboard/instructor/sessions')}
              >
                All sessions
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                  No sessions created yet. Schedule a session to open attendance.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {sessions.slice(0, 4).map((sess) => (
                    <div
                      key={sess.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-xs hover:border-[var(--primary)]/40 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">{sess.title}</p>
                        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-[11px] mt-0.5">
                          <Calendar className="h-3 w-3" />
                          <span>{sess.date ? new Date(sess.date).toLocaleDateString() : 'TBA'}</span>
                          {sess.location && <span>• {sess.location}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={sess.status} />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2"
                          onClick={() => navigate('/dashboard/instructor/sessions')}
                        >
                          <KeyRound className="mr-1 h-3 w-3" />
                          PIN
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/dashboard/instructor/attendance')}
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                Open Attendance Roster
              </Button>
            </div>
          </Card>
        </div>

        {/* Submissions Pending Grading */}
        <div className="lg:col-span-6">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Grading Queue</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  {pendingGrading.length} submissions pending review and feedback
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/dashboard/instructor/submissions')}
              >
                View all
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : pendingGrading.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                  All caught up! Zero unreviewed submissions in the queue.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingGrading.slice(0, 4).map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-xs hover:border-[var(--primary)]/40 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {sub.user?.fullName || 'Student Deliverable'}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                          Task: {sub.task?.title || 'Assignment'} • v{sub.version}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="h-7 text-xs px-2.5"
                        onClick={() => navigate('/dashboard/instructor/submissions')}
                      >
                        Grade
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/dashboard/instructor/tasks')}
              >
                <CheckSquare className="mr-1.5 h-3.5 w-3.5" />
                Manage Task Bank
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
