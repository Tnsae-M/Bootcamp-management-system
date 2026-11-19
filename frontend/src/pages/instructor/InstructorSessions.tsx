import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  Plus,
  KeyRound,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { sessionsService } from '@/services/sessions.service';
import { attendanceService } from '@/services/attendance.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { Session, Bootcamp } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Session Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    bootcampId: '',
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  // Active Attendance PIN Modal / State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [activePinData, setActivePinData] = useState<{
    code: string;
    sessionTitle: string;
    windowMinutes: number;
    expiresAt?: string;
  } | null>(null);
  const [openingPin, setOpeningPin] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const [sessList, bcList] = await Promise.all([
        sessionsService.getSessions().catch(() => []),
        bootcampsService.getBootcamps().catch(() => []),
      ]);
      setSessions(sessList);
      setBootcamps(bcList);
      if (bcList.length > 0 && !sessionForm.bootcampId) {
        setSessionForm((prev) => ({ ...prev, bootcampId: bcList[0].id }));
      }
    } catch {
      toast.error('Failed to load session schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionForm.title.trim()) {
      toast.error('Session title is required');
      return;
    }
    if (!sessionForm.bootcampId) {
      toast.error('Please select a target bootcamp');
      return;
    }

    setCreating(true);
    try {
      await sessionsService.createSession({
        ...sessionForm,
        title: sessionForm.title.trim(),
        description: sessionForm.description.trim() || undefined,
        location: sessionForm.location.trim() || undefined,
        date: sessionForm.date || new Date().toISOString().split('T')[0],
      });

      toast.success('Session created successfully!');
      setCreateModalOpen(false);
      setSessionForm({
        bootcampId: bootcamps[0]?.id || '',
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
      });
      loadSessions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleOpenAttendancePin = async (session: Session) => {
    setOpeningPin(true);
    try {
      const res: any = await attendanceService.openWindow({
        sessionId: session.id,
        windowMinutes: 15,
      });

      const pin = res.code || res.data?.code || res.data?.attendanceCode?.code || 'PIN-ACTIVE';
      setActivePinData({
        code: pin,
        sessionTitle: session.title,
        windowMinutes: 15,
        expiresAt: res.expiresAt || res.data?.expiresAt,
      });
      setPinModalOpen(true);
      toast.success(`Attendance window opened for "${session.title}"!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to open attendance window');
    } finally {
      setOpeningPin(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Session Delivery & Curriculum"
        description="Schedule live workshops, open dynamic attendance windows, and oversee session completion"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Schedule New Session
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
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-10 w-10" />}
          title="No Sessions Scheduled"
          description="Create your first session to begin lecturing and collecting attendance."
          action={{
            label: 'Schedule First Session',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <Card key={sess.id} className="border-[var(--border)] shadow-xs">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[var(--foreground)]">{sess.title}</span>
                    <StatusBadge status={sess.status} />
                  </div>

                  {sess.description && (
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                      {sess.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{sess.date ? new Date(sess.date).toLocaleDateString() : 'TBA'}</span>
                    </div>
                    {sess.startTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{sess.startTime} {sess.endTime ? `— ${sess.endTime}` : ''}</span>
                      </div>
                    )}
                    {sess.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{sess.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleOpenAttendancePin(sess)}
                    disabled={openingPin}
                  >
                    <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                    Open Attendance PIN
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => !creating && setCreateModalOpen(false)}
        title="Schedule New Session"
        subtitle="Configure lecture details, date, and venue"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Target Bootcamp" required>
            <select
              value={sessionForm.bootcampId}
              onChange={(e) => setSessionForm({ ...sessionForm, bootcampId: e.target.value })}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              {bootcamps.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title || b.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Session Title" required>
            <Input
              placeholder="e.g. Lab 03: Binary Exploitation & Stack Overflows"
              value={sessionForm.title}
              onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
              disabled={creating}
            />
          </FormField>

          <FormField label="Description / Agenda">
            <Textarea
              rows={2}
              placeholder="Overview of topics and practical exercises covered in this lecture..."
              value={sessionForm.description}
              onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
              disabled={creating}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Date" required>
              <Input
                type="date"
                value={sessionForm.date}
                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                disabled={creating}
              />
            </FormField>

            <FormField label="Location / Venue">
              <Input
                placeholder="e.g. Lab B204 or Google Meet link"
                value={sessionForm.location}
                onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                disabled={creating}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Start Time">
              <Input
                type="time"
                value={sessionForm.startTime}
                onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                disabled={creating}
              />
            </FormField>
            <FormField label="End Time">
              <Input
                type="time"
                value={sessionForm.endTime}
                onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
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
                'Publish Session'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Active PIN Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Live Attendance Window"
        subtitle={`Displaying PIN for ${activePinData?.sessionTitle}`}
        size="md"
      >
        <div className="space-y-6 text-center py-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-foreground)]">
              Direct Students to Enter This PIN
            </p>
            <div className="mx-auto inline-flex items-center justify-center rounded-2xl border-2 border-[var(--primary)] bg-[var(--accent)] px-8 py-5">
              <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-widest text-[var(--primary)] select-all">
                {activePinData?.code}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (activePinData?.code) {
                  navigator.clipboard.writeText(activePinData.code);
                  toast.success('PIN code copied to clipboard');
                }
              }}
            >
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Code
            </Button>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto leading-relaxed">
            This verification code is valid for {activePinData?.windowMinutes || 15} minutes.
            Attendance submissions are logged immediately with cryptographic verification.
          </p>

          <Button className="w-full" onClick={() => setPinModalOpen(false)}>
            Close Window
          </Button>
        </div>
      </Modal>
    </div>
  );
}
