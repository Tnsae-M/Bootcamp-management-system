import React, { useEffect, useState } from 'react';
import {
  ClipboardList,
  UserCheck,
  UserX,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsService } from '@/services/enrollments.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { Enrollment, Bootcamp } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminEnrollments() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [selectedBootcampId, setSelectedBootcampId] = useState<string>('');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Screening Modal
  const [screenModalOpen, setScreenModalOpen] = useState(false);
  const [selectedEnr, setSelectedEnr] = useState<Enrollment | null>(null);
  const [screeningStatus, setScreeningStatus] = useState<string>('STUDENT');
  const [screeningNote, setScreeningNote] = useState<string>('');
  const [submittingScreen, setSubmittingScreen] = useState(false);

  useEffect(() => {
    loadBootcamps();
  }, []);

  const loadBootcamps = async () => {
    setLoading(true);
    try {
      const bcList = await bootcampsService.getBootcamps();
      setBootcamps(bcList);
      if (bcList.length > 0) {
        const firstId = bcList[0].id;
        setSelectedBootcampId(firstId);
        loadEnrollments(firstId);
      }
    } catch {
      toast.error('Failed to load bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async (bcId: string) => {
    setLoadingEnrollments(true);
    try {
      const list = await enrollmentsService.getBootcampEnrollments(bcId);
      setEnrollments(list);
    } catch {
      toast.error('Failed to load bootcamp applicants');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const openScreeningModal = (enr: Enrollment, defaultStatus: string = 'STUDENT') => {
    setSelectedEnr(enr);
    setScreeningStatus(defaultStatus);
    setScreeningNote('');
    setScreenModalOpen(true);
  };

  const handleScreenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnr || !selectedBootcampId) return;

    setSubmittingScreen(true);
    try {
      await enrollmentsService.screenApplicant(selectedBootcampId, {
        enrollmentId: selectedEnr.id,
        status: screeningStatus,
        note: screeningNote.trim() || undefined,
      });

      toast.success(`Applicant status updated to ${screeningStatus}`);
      setScreenModalOpen(false);
      loadEnrollments(selectedBootcampId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to screen applicant');
    } finally {
      setSubmittingScreen(false);
    }
  };

  const selectedBootcamp = bootcamps.find((b) => b.id === selectedBootcampId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Applicant Screening & Admissions"
        description="Review prospective candidate applications, evaluate motivation statements, and admit students"
      />

      {/* Bootcamp Filter Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">Select Cohort:</span>
          <select
            value={selectedBootcampId}
            onChange={(e) => {
              setSelectedBootcampId(e.target.value);
              loadEnrollments(e.target.value);
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)]"
          >
            {bootcamps.map((bc) => (
              <option key={bc.id} value={bc.id}>
                {bc.title || bc.name} ({bc.status})
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          Total Candidates: <span className="font-semibold text-[var(--foreground)]">{enrollments.length}</span>
        </p>
      </div>

      {loading || loadingEnrollments ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-10 w-10" />}
          title="No Applicants Registered"
          description={
            selectedBootcamp
              ? `There are no candidate applications on file for "${selectedBootcamp.title}".`
              : 'Select a cohort to view applicant submissions.'
          }
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Applicant</th>
                <th className="px-4 py-3 text-left font-semibold">University ID</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Motivation Statement</th>
                <th className="px-4 py-3 text-left font-semibold">Portfolio</th>
                <th className="px-4 py-3 text-right font-semibold">Screening Decisions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {enrollments.map((enr) => (
                <tr key={enr.id} className="hover:bg-[var(--accent)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--foreground)]">{enr.user?.fullName || 'Applicant'}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">{enr.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono">
                    {enr.user?.universityId || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={enr.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] italic max-w-xs truncate">
                    {enr.motivation || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {enr.portfolioUrl ? (
                      <a
                        href={enr.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5">
                    <Button
                      size="sm"
                      className="h-7 text-xs px-2.5 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => openScreeningModal(enr, 'STUDENT')}
                    >
                      <UserCheck className="mr-1 h-3 w-3" />
                      Admit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2.5 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                      onClick={() => openScreeningModal(enr, 'APPLICANT_REJECTED')}
                    >
                      <UserX className="mr-1 h-3 w-3" />
                      Reject
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Screen Modal */}
      <Modal
        isOpen={screenModalOpen}
        onClose={() => setScreenModalOpen(false)}
        title={`Admissions Decision: ${selectedEnr?.user?.fullName || 'Candidate'}`}
        subtitle="Confirm candidate status for this cohort"
        size="md"
      >
        <form onSubmit={handleScreenSubmit} className="space-y-4">
          <FormField label="Screening Status" required>
            <select
              value={screeningStatus}
              onChange={(e) => setScreeningStatus(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              <option value="STUDENT">Admit as Enrolled Student (STUDENT)</option>
              <option value="APPLICANT_REJECTED">Decline Application (APPLICANT_REJECTED)</option>
              <option value="APPLICANT">Keep in Review (APPLICANT)</option>
            </select>
          </FormField>

          <FormField label="Admissions Note / Internal Feedback (Optional)">
            <Textarea
              rows={3}
              placeholder="Candidate demonstrated prerequisite proficiency in screening quiz..."
              value={screeningNote}
              onChange={(e) => setScreeningNote(e.target.value)}
              disabled={submittingScreen}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setScreenModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submittingScreen}>
              {submittingScreen ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Record Decision'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
