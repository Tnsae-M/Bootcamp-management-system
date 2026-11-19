import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Plus,
  Calendar,
  Layers,
  Award,
  Settings2,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { bootcampsService } from '@/services/bootcamps.service';
import { divisionsService } from '@/services/divisions.service';
import { Bootcamp, Division, BootcampStatus } from '@/types';
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

export default function AdminBootcamps() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [bootcampForm, setBootcampForm] = useState({
    title: '',
    divisionId: '',
    description: '',
    startDate: '',
    endDate: '',
    maxApplicants: 100,
    attendanceWeight: 30,
    individualTaskWeight: 40,
    groupMilestoneWeight: 20,
    peerReviewWeight: 10,
  });

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetBootcamp, setTargetBootcamp] = useState<Bootcamp | null>(null);
  const [newStatus, setNewStatus] = useState<string>('OPEN');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadBootcamps();
  }, []);

  const loadBootcamps = async () => {
    setLoading(true);
    try {
      const [bcList, divList] = await Promise.all([
        bootcampsService.getBootcamps().catch(() => []),
        divisionsService.getDivisions().catch(() => []),
      ]);
      setBootcamps(bcList);
      setDivisions(divList);
      if (divList.length > 0 && !bootcampForm.divisionId) {
        setBootcampForm((prev) => ({ ...prev, divisionId: divList[0].id }));
      }
    } catch {
      toast.error('Failed to load bootcamps list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bootcampForm.title.trim()) {
      toast.error('Bootcamp title is required');
      return;
    }
    if (!bootcampForm.divisionId) {
      toast.error('Please assign a division');
      return;
    }

    const totalWeight =
      Number(bootcampForm.attendanceWeight) +
      Number(bootcampForm.individualTaskWeight) +
      Number(bootcampForm.groupMilestoneWeight) +
      Number(bootcampForm.peerReviewWeight);

    if (totalWeight !== 100) {
      toast.error(`Weights must sum to 100% (currently ${totalWeight}%)`);
      return;
    }

    setCreating(true);
    try {
      await bootcampsService.createBootcamp(bootcampForm.divisionId, {
        title: bootcampForm.title.trim(),
        description: bootcampForm.description.trim() || undefined,
        startDate: bootcampForm.startDate || undefined,
        endDate: bootcampForm.endDate || undefined,
        maxApplicants: Number(bootcampForm.maxApplicants) || undefined,
        attendanceWeight: Number(bootcampForm.attendanceWeight),
        individualTaskWeight: Number(bootcampForm.individualTaskWeight),
        groupMilestoneWeight: Number(bootcampForm.groupMilestoneWeight),
        peerReviewWeight: Number(bootcampForm.peerReviewWeight),
      });

      toast.success('Bootcamp created successfully!');
      setCreateModalOpen(false);
      setBootcampForm({
        title: '',
        divisionId: divisions[0]?.id || '',
        description: '',
        startDate: '',
        endDate: '',
        maxApplicants: 100,
        attendanceWeight: 30,
        individualTaskWeight: 40,
        groupMilestoneWeight: 20,
        peerReviewWeight: 10,
      });
      loadBootcamps();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create bootcamp');
    } finally {
      setCreating(false);
    }
  };

  const openStatusTransition = (bc: Bootcamp) => {
    setTargetBootcamp(bc);
    setNewStatus(bc.status as string);
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBootcamp) return;

    setUpdatingStatus(true);
    try {
      await bootcampsService.updateStatus(targetBootcamp.id, newStatus);
      toast.success(`Bootcamp status updated to ${newStatus}`);
      setStatusModalOpen(false);
      loadBootcamps();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to transition status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bootcamps & Cohort Lifecycle"
        description="Launch new cohorts, configure multi-signal induction weights, and manage lifecycle phases"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Launch Bootcamp
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
      ) : bootcamps.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="No Bootcamps Created"
          description="Create your first cohort program to begin admitting students."
          action={{
            label: 'Launch First Bootcamp',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {bootcamps.map((bc) => (
            <Card key={bc.id} className="border-[var(--border)] shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[var(--foreground)]">
                      {bc.title || bc.name}
                    </span>
                    <StatusBadge status={bc.status} />
                    {bc.division?.name && (
                      <span className="rounded-md bg-[var(--accent)] px-2 py-0.5 text-[11px] font-semibold text-[var(--accent-foreground)]">
                        {bc.division.name}
                      </span>
                    )}
                  </div>

                  {bc.description && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                      {bc.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {bc.startDate ? new Date(bc.startDate).toLocaleDateString() : 'TBA'}
                        {' — '}
                        {bc.endDate ? new Date(bc.endDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                      <span>Weights: {bc.attendanceWeight}% / {bc.individualTaskWeight}% / {bc.groupMilestoneWeight}% / {bc.peerReviewWeight}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => openStatusTransition(bc)}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Lifecycle: {bc.status}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Bootcamp Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        title="Launch New Bootcamp Cohort"
        subtitle="Configure division pillar, timelines, and induction evaluation weights"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Bootcamp Title" required>
              <Input
                placeholder="e.g. Competitive Programming Winter 2026"
                value={bootcampForm.title}
                onChange={(e) => setBootcampForm({ ...bootcampForm, title: e.target.value })}
                disabled={creating}
              />
            </FormField>

            <FormField label="Division Track" required>
              <select
                value={bootcampForm.divisionId}
                onChange={(e) => setBootcampForm({ ...bootcampForm, divisionId: e.target.value })}
                className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
              >
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Bootcamp Description / Curriculum Overview">
            <Textarea
              rows={2}
              placeholder="Core focus, topics covered, target skill outcomes..."
              value={bootcampForm.description}
              onChange={(e) => setBootcampForm({ ...bootcampForm, description: e.target.value })}
              disabled={creating}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Start Date">
              <Input
                type="date"
                value={bootcampForm.startDate}
                onChange={(e) => setBootcampForm({ ...bootcampForm, startDate: e.target.value })}
                disabled={creating}
              />
            </FormField>
            <FormField label="End Date">
              <Input
                type="date"
                value={bootcampForm.endDate}
                onChange={(e) => setBootcampForm({ ...bootcampForm, endDate: e.target.value })}
                disabled={creating}
              />
            </FormField>
            <FormField label="Target Capacity">
              <Input
                type="number"
                min={10}
                max={500}
                value={bootcampForm.maxApplicants}
                onChange={(e) => setBootcampForm({ ...bootcampForm, maxApplicants: Number(e.target.value) })}
                disabled={creating}
              />
            </FormField>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
              Induction Signal Allocation (Must sum to 100%)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <FormField label="Attendance (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={bootcampForm.attendanceWeight}
                  onChange={(e) => setBootcampForm({ ...bootcampForm, attendanceWeight: Number(e.target.value) })}
                  disabled={creating}
                />
              </FormField>
              <FormField label="Tasks (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={bootcampForm.individualTaskWeight}
                  onChange={(e) => setBootcampForm({ ...bootcampForm, individualTaskWeight: Number(e.target.value) })}
                  disabled={creating}
                />
              </FormField>
              <FormField label="Milestones (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={bootcampForm.groupMilestoneWeight}
                  onChange={(e) => setBootcampForm({ ...bootcampForm, groupMilestoneWeight: Number(e.target.value) })}
                  disabled={creating}
                />
              </FormField>
              <FormField label="Peer Review (%)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={bootcampForm.peerReviewWeight}
                  onChange={(e) => setBootcampForm({ ...bootcampForm, peerReviewWeight: Number(e.target.value) })}
                  disabled={creating}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Create Bootcamp'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Transition Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Lifecycle Transition: ${targetBootcamp?.title || targetBootcamp?.name}`}
        subtitle="Advance the cohort phase according to the canonical lifecycle"
        size="md"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <FormField label="New Bootcamp Status" required>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              <option value="DRAFT">DRAFT (Authoring & preparation)</option>
              <option value="OPEN">OPEN (Accepting student applications)</option>
              <option value="SCREENING">SCREENING (Evaluating applicants)</option>
              <option value="ACTIVE">ACTIVE (Lectures & submissions in progress)</option>
              <option value="COMPLETED">COMPLETED (Inductions computed & finalized)</option>
              <option value="ARCHIVED">ARCHIVED (Historical record)</option>
            </select>
          </FormField>

          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Transitioning to <strong>OPEN</strong> allows guests to apply. Transitioning to{' '}
            <strong>ACTIVE</strong> begins session attendance and task submissions.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatingStatus}>
              {updatingStatus ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Update Lifecycle Phase'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
