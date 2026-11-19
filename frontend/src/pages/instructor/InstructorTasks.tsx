import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Trash2,
  FileCode,
  Loader2,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { tasksService } from '@/services/tasks.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { Task, Bootcamp } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorTasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Task Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [taskForm, setTaskForm] = useState({
    bootcampId: '',
    title: '',
    type: 'INDIVIDUAL',
    submissionType: 'GITHUB_LINK',
    description: '',
    deadline: '',
    maxScore: 100,
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [taskList, bcList] = await Promise.all([
        tasksService.getTasks().catch(() => []),
        bootcampsService.getBootcamps().catch(() => []),
      ]);
      setTasks(taskList);
      setBootcamps(bcList);
      if (bcList.length > 0 && !taskForm.bootcampId) {
        setTaskForm((prev) => ({ ...prev, bootcampId: bcList[0].id }));
      }
    } catch {
      toast.error('Failed to load tasks bank');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (!taskForm.bootcampId) {
      toast.error('Please select a target bootcamp');
      return;
    }

    setCreating(true);
    try {
      await tasksService.createTask({
        ...taskForm,
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : new Date().toISOString(),
        maxScore: Number(taskForm.maxScore) || 100,
      });

      toast.success('Task created and published!');
      setCreateModalOpen(false);
      setTaskForm({
        bootcampId: bootcamps[0]?.id || '',
        title: '',
        type: 'INDIVIDUAL',
        submissionType: 'GITHUB_LINK',
        description: '',
        deadline: '',
        maxScore: 100,
      });
      loadTasks();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await tasksService.deleteTask(id);
      toast.success('Task removed');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Assignments Bank"
        description="Author problem sets, milestone rubrics, and submission specifications"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Assignment
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="h-10 w-10" />}
          title="No Tasks Found"
          description="You haven't authored any assignments for your cohorts yet."
          action={{
            label: 'Create First Task',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card key={task.id} className="border-[var(--border)] shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--foreground)]">{task.title}</span>
                    <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                      {task.type?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                      {task.maxScore} pts
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Due: {task.deadline ? new Date(task.deadline).toLocaleString() : 'No cutoff'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCode className="h-3.5 w-3.5" />
                      <span>Submissions: {task.submissionType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => navigate('/dashboard/instructor/submissions')}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" />
                    Submissions
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleDeleteTask(task.id, task.title)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        title="Create New Assignment"
        subtitle="Set deliverables, deadlines, and maximum points"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Target Bootcamp" required>
            <select
              value={taskForm.bootcampId}
              onChange={(e) => setTaskForm({ ...taskForm, bootcampId: e.target.value })}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              {bootcamps.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title || b.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Task Title" required>
            <Input
              placeholder="e.g. Lab 02: Network Traffic Capture Analysis"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              disabled={creating}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Task Scope" required>
              <select
                value={taskForm.type}
                onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
              >
                <option value="INDIVIDUAL">Individual Deliverable</option>
                <option value="GROUP_MILESTONE">Group Milestone</option>
              </select>
            </FormField>

            <FormField label="Expected Submission Format" required>
              <select
                value={taskForm.submissionType}
                onChange={(e) => setTaskForm({ ...taskForm, submissionType: e.target.value })}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
              >
                <option value="GITHUB_LINK">GitHub Repository / PR</option>
                <option value="FILE">File / PDF Upload</option>
                <option value="BOTH">Either / Both</option>
              </select>
            </FormField>
          </div>

          <FormField label="Instructions & Rubric Overview">
            <Textarea
              rows={3}
              placeholder="Detailed submission guidelines, grading criteria, and deliverables..."
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              disabled={creating}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Deadline" required>
              <Input
                type="datetime-local"
                value={taskForm.deadline}
                onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                disabled={creating}
              />
            </FormField>

            <FormField label="Max Points / Score" required>
              <Input
                type="number"
                min={1}
                max={500}
                value={taskForm.maxScore}
                onChange={(e) => setTaskForm({ ...taskForm, maxScore: Number(e.target.value) })}
                disabled={creating}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Publish Assignment'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
