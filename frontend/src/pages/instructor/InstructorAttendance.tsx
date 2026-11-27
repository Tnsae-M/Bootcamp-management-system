import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Calendar,
  Clock,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { sessionsService } from '@/services/sessions.service';
import { attendanceService } from '@/services/attendance.service';
import { Session, AttendanceRecord } from '@/types';
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

export default function InstructorAttendance() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Override Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [newStatus, setNewStatus] = useState<string>('PRESENT');
  const [overrideNote, setOverrideNote] = useState<string>('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const sessList = await sessionsService.getSessions();
      setSessions(sessList);
      if (sessList.length > 0) {
        const firstId = sessList[0].id;
        setSelectedSessionId(firstId);
        loadRecords(firstId);
      }
    } catch {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const loadRecords = async (sessId: string) => {
    setLoadingRecords(true);
    try {
      const recList = await attendanceService.getSessionAttendance(sessId);
      setRecords(recList);
    } catch {
      toast.error('Failed to load attendance records');
    } finally {
      setLoadingRecords(false);
    }
  };

  const openOverrideModal = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setNewStatus(record.status || 'PRESENT');
    setOverrideNote(record.overrideNote || '');
    setOverrideModalOpen(true);
  };

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setSubmittingOverride(true);
    try {
      await attendanceService.overrideAttendance({
        sessionId: selectedRecord.sessionId || selectedSessionId,
        userId: selectedRecord.userId,
        status: newStatus,
        overrideNote: overrideNote || undefined,
      });
      toast.success('Attendance override recorded');
      setOverrideModalOpen(false);
      if (selectedSessionId) loadRecords(selectedSessionId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to override attendance');
    } finally {
      setSubmittingOverride(false);
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Roster & Verification"
        description="Review student check-ins per session, audit time-stamps, and manually override excused absences"
      />

      {/* Session Filter Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--muted-foreground)]">Select Session:</span>
          <select
            value={selectedSessionId}
            onChange={(e) => {
              setSelectedSessionId(e.target.value);
              loadRecords(e.target.value);
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)]"
          >
            {sessions.map((sess) => (
              <option key={sess.id} value={sess.id}>
                {sess.title} ({sess.date ? new Date(sess.date).toLocaleDateString() : 'TBA'})
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          Total Attendees Logged: <span className="font-semibold text-[var(--foreground)]">{records.length}</span>
        </p>
      </div>

      {loading || loadingRecords ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="h-10 w-10" />}
          title="No Attendance Records Logged"
          description={
            selectedSession
              ? `Zero students have entered the attendance PIN for "${selectedSession.title}".`
              : 'Select a session to view attendance history.'
          }
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Check-in Status</th>
                <th className="px-4 py-3 text-left font-semibold">Timestamp</th>
                <th className="px-4 py-3 text-left font-semibold">Override Reason</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {records.map((rec) => (
                <tr key={rec.id} className="hover:bg-[var(--accent)]/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {rec.user?.fullName || 'Student'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {rec.user?.email || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {rec.submittedAt ? new Date(rec.submittedAt).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] italic max-w-xs truncate">
                    {rec.overrideNote || '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => openOverrideModal(rec)}
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      Override
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => !submittingOverride && setOverrideModalOpen(false)}
        title={`Override Attendance: ${selectedRecord?.user?.fullName || 'Student'}`}
        subtitle="Manually adjust student attendance record"
        size="md"
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-4">
          <FormField label="Updated Status" required>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              <option value="PRESENT">PRESENT</option>
              <option value="LATE">LATE</option>
              <option value="EXCUSED">EXCUSED</option>
              <option value="ABSENT">ABSENT</option>
            </select>
          </FormField>

          <FormField label="Override Justification Note" hint="e.g. Official exam conflict, lab equipment issue">
            <Textarea
              rows={3}
              placeholder="Provide reason for this manual attendance change..."
              value={overrideNote}
              onChange={(e) => setOverrideNote(e.target.value)}
              disabled={submittingOverride}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOverrideModalOpen(false)}
              disabled={submittingOverride}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submittingOverride}>
              {submittingOverride ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Override'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
