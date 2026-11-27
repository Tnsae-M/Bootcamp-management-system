import React, { useEffect, useState } from 'react';
import {
  FileText,
  Award,
  Link as LinkIcon,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { submissionsService } from '@/services/submissions.service';
import { tasksService } from '@/services/tasks.service';
import { Submission, Task } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTaskId, setSelectedTaskId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Grading Modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [score, setScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [qualFlag, setQualFlag] = useState<string>('SATISFACTORY');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const taskList = await tasksService.getTasks().catch(() => []);
      const subArrays = await Promise.all(
        taskList.map((t) => submissionsService.getSubmissionsByTask(t.id).catch(() => []))
      );
      setTasks(taskList);
      setSubmissions(subArrays.flat());
    } catch {
      toast.error('Failed to load submissions queue');
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (sub: Submission) => {
    setSelectedSub(sub);
    setScore(sub.score || 85);
    setFeedback(sub.feedback || '');
    setQualFlag(sub.qualFlag || 'SATISFACTORY');
    setGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGrading(true);
    try {
      await submissionsService.grade(selectedSub.id, {
        score: Number(score),
        feedback: feedback.trim() || undefined,
        qualFlag: qualFlag as any,
      });

      toast.success('Submission graded and feedback recorded!');
      setGradeModalOpen(false);
      // Reload
      const updated = await submissionsService.getSubmissionsByTask(selectedSub.taskId);
      setSubmissions((prev) => [
        ...prev.filter((s) => s.taskId !== selectedSub.taskId),
        ...updated,
      ]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit grade');
    } finally {
      setGrading(false);
    }
  };

  const filtered = submissions.filter((s) => {
    if (selectedTaskId !== 'ALL' && s.taskId !== selectedTaskId) return false;
    if (statusFilter === 'PENDING' && s.status?.toUpperCase() === 'GRADED') return false;
    if (statusFilter === 'GRADED' && s.status?.toUpperCase() !== 'GRADED') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Submissions & Grading"
        description="Audit code deliverables, assign mastery points, and provide constructive technical critique"
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)]"
          >
            <option value="ALL">All Assignments</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="GRADED">Graded</option>
          </select>
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          Showing {filtered.length} of {submissions.length} submissions
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-10 w-10" />}
          title="No Submissions Match Filters"
          description="There are currently no deliverables submitted for the chosen criteria."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const isGraded = sub.status?.toUpperCase() === 'GRADED';
            const task = tasks.find((t) => t.id === sub.taskId) || sub.task;

            return (
              <Card key={sub.id} className="border-[var(--border)] shadow-xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[var(--foreground)]">
                        {sub.user?.fullName || 'Student Deliverable'}
                      </span>
                      <StatusBadge status={sub.status} />
                      {isGraded && (
                        <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600 dark:text-green-400">
                          {sub.score} / {task?.maxScore || 100} pts
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted-foreground)]">
                      Task: <span className="font-semibold text-[var(--foreground)]">{task?.title || 'Assignment'}</span>
                      {' • '}v{sub.version}
                      {sub.submittedAt && ` • Submitted ${new Date(sub.submittedAt).toLocaleString()}`}
                    </p>

                    {sub.feedback && (
                      <p className="text-xs text-[var(--muted-foreground)] italic pt-0.5">
                        Feedback: "{sub.feedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {sub.githubUrl && (
                      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                        <a href={sub.githubUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                          View Code
                        </a>
                      </Button>
                    )}

                    <Button size="sm" className="h-8 text-xs" onClick={() => openGradingModal(sub)}>
                      <Award className="mr-1.5 h-3.5 w-3.5" />
                      {isGraded ? 'Update Grade' : 'Grade Submission'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Grade Modal */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => !grading && setGradeModalOpen(false)}
        title={`Grade: ${selectedSub?.user?.fullName || 'Deliverable'}`}
        subtitle={`Evaluation for ${selectedSub?.task?.title || 'Assignment'}`}
        size="md"
      >
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Assigned Score (pts)" required>
              <Input
                type="number"
                min={0}
                max={selectedSub?.task?.maxScore || 100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                disabled={grading}
              />
            </FormField>

            <FormField label="Qualitative Assessment" required>
              <select
                value={qualFlag}
                onChange={(e) => setQualFlag(e.target.value)}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
              >
                <option value="EXCELLENT">Excellent (Exceeds Rubric)</option>
                <option value="SATISFACTORY">Satisfactory (Meets Standard)</option>
                <option value="NEEDS_IMPROVEMENT">Needs Improvement</option>
              </select>
            </FormField>
          </div>

          <FormField label="Instructor Feedback & Code Review Notes">
            <Textarea
              rows={4}
              placeholder="Good implementation of core algorithms. Notice edge cases around empty input arrays..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={grading}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setGradeModalOpen(false)}
              disabled={grading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={grading}>
              {grading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Save Evaluation'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
