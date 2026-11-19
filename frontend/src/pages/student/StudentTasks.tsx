import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Calendar,
  Clock,
  Link as LinkIcon,
  FileCode,
  Loader2,
  CheckCircle2,
  Award,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { tasksService } from '@/services/tasks.service';
import { submissionsService } from '@/services/submissions.service';
import { Task, Submission } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [githubUrl, setGithubUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadTasksData();
  }, []);

  const loadTasksData = async () => {
    setLoading(true);
    try {
      const [taskList, subList] = await Promise.all([
        tasksService.getTasks().catch(() => []),
        submissionsService.getSubmissions().catch(() => []),
      ]);
      setTasks(taskList);
      setSubmissions(subList);
    } catch {
      toast.error('Failed to load tasks and assignments');
    } finally {
      setLoading(false);
    }
  };

  const openSubmitModal = (task: Task) => {
    setSelectedTask(task);
    setGithubUrl('');
    setNotes('');
    setSubmitError(null);
    setSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    if (!githubUrl.trim()) {
      setSubmitError('Repository or submission URL is required');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submissionsService.submit(selectedTask.id, {
        githubUrl: githubUrl.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success(`Submission uploaded for "${selectedTask.title}"!`);
      setSubmitModalOpen(false);
      // Reload submissions
      const updated = await submissionsService.getSubmissions();
      setSubmissions(updated);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record submission';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Assignments"
        description="Individual lab deliverables and group milestones contributing to your induction performance"
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-12 w-full" />
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-10 w-10" />}
          title="No Active Assignments"
          description="There are currently no tasks or milestones due for your cohort."
        />
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const submission = submissions.find((s) => s.taskId === task.id);
            const isGraded = submission?.status?.toUpperCase() === 'GRADED';
            const isSubmitted = !!submission;
            const isPastDeadline = task.deadline && new Date(task.deadline) < new Date();

            return (
              <Card key={task.id} className="border-[var(--border)] shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                          <FileCode className="h-3 w-3" />
                          {task.type?.replace(/_/g, ' ') || 'TASK'}
                        </span>
                        {task.maxScore && (
                          <span className="text-[11px] text-[var(--muted-foreground)]">
                            Max Score: {task.maxScore} pts
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {isGraded ? (
                        <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                          <Award className="h-3.5 w-3.5" />
                          <span>Score: {submission.score} / {task.maxScore}</span>
                        </div>
                      ) : isSubmitted ? (
                        <StatusBadge status="SUBMITTED" />
                      ) : isPastDeadline ? (
                        <StatusBadge status="OVERDUE" />
                      ) : (
                        <StatusBadge status="PENDING" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  {task.description && (
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {/* Submission Details if submitted */}
                  {submission && (
                    <div className="rounded-lg bg-[var(--muted)]/50 p-3 border border-[var(--border)] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[var(--foreground)] flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                          Submitted on {new Date(submission.submittedAt || Date.now()).toLocaleDateString()}
                        </span>
                        {submission.githubUrl && (
                          <a
                            href={submission.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                          >
                            <LinkIcon className="h-3 w-3" />
                            View Submission
                          </a>
                        )}
                      </div>

                      {submission.feedback && (
                        <div className="pt-1.5 border-t border-[var(--border)] mt-1.5">
                          <span className="font-semibold text-[var(--foreground)]">Instructor Feedback: </span>
                          <span className="text-[var(--muted-foreground)] italic">"{submission.feedback}"</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] pt-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Deadline: {task.deadline ? new Date(task.deadline).toLocaleString() : 'No cutoff'}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-[var(--border)] flex justify-end">
                  {!isSubmitted ? (
                    <Button size="sm" onClick={() => openSubmitModal(task)}>
                      Submit Deliverable
                    </Button>
                  ) : task.allowResubmission ? (
                    <Button variant="outline" size="sm" onClick={() => openSubmitModal(task)}>
                      Resubmit Work
                    </Button>
                  ) : null}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Submission Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => !submitting && setSubmitModalOpen(false)}
        title={`Submit: ${selectedTask?.title}`}
        subtitle="Provide your GitHub repository link or code deliverable"
        size="md"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          {submitError && (
            <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-600 border border-red-500/20">
              {submitError}
            </div>
          )}

          <FormField
            label="Repository or Deliverable URL"
            required
            hint="GitHub repository, PR link, or shared link"
          >
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="https://github.com/csec-astu/my-assignment"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="pl-9"
                disabled={submitting}
              />
            </div>
          </FormField>

          <FormField label="Submission Notes / Comments" hint="Any specific run instructions or dependencies">
            <Textarea
              rows={3}
              placeholder="Completed all core requirements. Bonus unit tests included in tests/ directory..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSubmitModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Confirm Submission'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
