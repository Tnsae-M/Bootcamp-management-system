import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  TrendingUp,
  KeyRound,
  Loader2,
  Clock,
  Layers,
  ArrowRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsService } from '@/services/enrollments.service';
import { sessionsService } from '@/services/sessions.service';
import { tasksService } from '@/services/tasks.service';
import { attendanceService } from '@/services/attendance.service';
import { Enrollment, Session, Task } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatGrid, StatItem } from '@/components/common/StatGrid';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Attendance PIN submit state
  const [pinCode, setPinCode] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [enrList, sessList, taskList] = await Promise.all([
        enrollmentsService.getMyEnrollments().catch(() => []),
        sessionsService.getSessions().catch(() => []),
        tasksService.getTasks().catch(() => []),
      ]);

      // Only count active/accepted enrollments for student
      const studentEnrollments = enrList.filter(
        (e) => e.status?.toUpperCase() === 'STUDENT' || e.status?.toUpperCase() === 'INDUCTED'
      );

      setEnrollments(studentEnrollments.length > 0 ? studentEnrollments : enrList);
      setSessions(sessList.slice(0, 5));
      setTasks(taskList.slice(0, 5));
    } catch {
      toast.error('Failed to load student dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);

    const trimmed = pinCode.trim();
    if (!trimmed) {
      setPinError('Attendance PIN is required');
      return;
    }

    setSubmittingPin(true);
    try {
      await attendanceService.submitCode({ code: trimmed });
      toast.success('Attendance recorded successfully! Session marked as present.');
      setPinCode('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired attendance PIN.';
      setPinError(msg);
      toast.error(msg);
    } finally {
      setSubmittingPin(false);
    }
  };

  const stats: StatItem[] = [
    {
      title: 'Enrolled Bootcamps',
      value: enrollments.length,
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      description: 'Active specialization tracks',
    },
    {
      title: 'Upcoming Sessions',
      value: sessions.length,
      icon: <Calendar className="h-5 w-5 text-purple-500" />,
      description: 'Lectures and lab drills',
    },
    {
      title: 'Active Assignments',
      value: tasks.length,
      icon: <CheckSquare className="h-5 w-5 text-amber-500" />,
      description: 'Pending individual tasks',
    },
    {
      title: 'Induction Status',
      value: 'Tracking',
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      description: 'Multi-signal evaluation active',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Learning Hub"
        description="Your centralized portal for cohort sessions, coding drills, and multi-signal induction progression"
      />

      {/* Top Stat Grid */}
      <StatGrid stats={stats} cols={4} />

      {/* Main Grid: Attendance PIN + Active Bootcamps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance PIN Check-in Box */}
        <div className="lg:col-span-5">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Quick Attendance Check-in</CardTitle>
                  <CardDescription className="text-xs text-[var(--muted-foreground)]">
                    Enter the time-sensitive code provided by your instructor
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <form onSubmit={handlePinSubmit} className="space-y-3">
                {pinError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{pinError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit PIN..."
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      if (pinError) setPinError(null);
                    }}
                    maxLength={10}
                    className="font-mono text-center tracking-widest uppercase font-bold"
                    disabled={submittingPin}
                  />
                  <Button type="submit" disabled={submittingPin} className="shrink-0">
                    {submittingPin ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="mr-1 h-3.5 w-3.5" />
                        Check-in
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                PIN windows typically remain valid for 10-15 minutes after session initiation. Check-in directly
                updates your attendance integrity signal.
              </p>
            </CardContent>

            <CardFooter className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/dashboard/student/sessions')}
              >
                View Full Attendance History
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Enrolled Bootcamps Card */}
        <div className="lg:col-span-7">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">My Enrolled Bootcamps</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Programs you are currently attending
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/dashboard/student/bootcamps')}
              >
                View All ({enrollments.length})
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : enrollments.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                  You are not yet enrolled in any active cohorts.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {enrollments.slice(0, 3).map((enr) => {
                    const bc = enr.bootcamp;
                    return (
                      <div
                        key={enr.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-xs hover:border-[var(--primary)]/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--muted)] text-[var(--foreground)]">
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">
                              {bc?.title || bc?.name || 'Bootcamp Cohort'}
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)]">
                              {bc?.division?.name || 'CSEC Division'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={enr.status} />
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs px-2"
                            onClick={() => navigate('/dashboard/student/progress')}
                          >
                            Progress
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted-foreground)]">
              <span>Track multi-signal metrics for active cohorts under the Progress portal.</span>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Lower Row: Upcoming Sessions & Pending Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Upcoming Sessions</CardTitle>
              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                Class meetings, labs, and office hours
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/dashboard/student/sessions')}
            >
              See all
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted-foreground)]">
                No upcoming sessions scheduled right now.
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{s.title}</p>
                      <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] text-[11px] mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{s.date ? new Date(s.date).toLocaleDateString() : 'TBA'}</span>
                        {s.location && <span>• {s.location}</span>}
                      </div>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks & Assignments */}
        <Card className="border-[var(--border)] shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Active Tasks</CardTitle>
              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                Problem sets and project deliverables
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/dashboard/student/tasks')}
            >
              See all
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted-foreground)]">
                No active tasks assigned yet.
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] text-xs"
                  >
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{t.title}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'No deadline'}
                        {t.maxScore ? ` • Max: ${t.maxScore} pts` : ''}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5"
                      onClick={() => navigate('/dashboard/student/tasks')}
                    >
                      Submit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
