import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  KeyRound,
  Loader2,
  CheckCircle2,
  Send,
  MessageSquare,
  Star,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { sessionsService } from '@/services/sessions.service';
import { attendanceService } from '@/services/attendance.service';
import { feedbackService } from '@/services/index';
import { Session, AttendanceRecord } from '@/types';
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

export default function StudentSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Attendance PIN
  const [pinCode, setPinCode] = useState('');
  const [submittingPin, setSubmittingPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  // Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    loadSessionsData();
  }, []);

  const loadSessionsData = async () => {
    setLoading(true);
    try {
      const [sessList, attList] = await Promise.all([
        sessionsService.getSessions().catch(() => []),
        attendanceService.getRecords().catch(() => []),
      ]);
      setSessions(sessList);
      setAttendanceRecords(attList);
    } catch {
      toast.error('Failed to load session schedule');
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
      toast.success('Attendance verified and recorded!');
      setPinCode('');
      // Reload records
      const updated = await attendanceService.getRecords();
      setAttendanceRecords(updated);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired attendance PIN.';
      setPinError(msg);
      toast.error(msg);
    } finally {
      setSubmittingPin(false);
    }
  };

  const openFeedback = (session: Session) => {
    setSelectedSession(session);
    setRating(5);
    setComment('');
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    setSubmittingFeedback(true);
    try {
      await feedbackService.submitFeedback(selectedSession.id, { rating, comment });
      toast.success('Feedback submitted! Thank you.');
      setFeedbackModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sessions & Attendance"
        description="View scheduled lectures, lab workshops, and verify your physical/online presence"
      />

      {/* Attendance PIN Card */}
      <Card className="border-[var(--border)] shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Attendance PIN Verification</CardTitle>
              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                Enter the session code shared by the instructor to mark yourself present
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
            <Input
              placeholder="e.g. 849201"
              value={pinCode}
              onChange={(e) => {
                setPinCode(e.target.value);
                if (pinError) setPinError(null);
              }}
              maxLength={10}
              className="font-mono text-center tracking-widest uppercase font-bold text-base h-10"
              disabled={submittingPin}
            />
            <Button type="submit" disabled={submittingPin} className="h-10 shrink-0">
              {submittingPin ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Check In
                </>
              )}
            </Button>
          </form>
          {pinError && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-[var(--foreground)]">Cohort Sessions</h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </Card>
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={<Calendar className="h-10 w-10" />}
            title="No Sessions Scheduled"
            description="There are currently no sessions published for your cohort tracks."
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((sess) => {
              const record = attendanceRecords.find((r) => r.sessionId === sess.id);
              const isCompleted = sess.status?.toUpperCase() === 'COMPLETED';

              return (
                <Card key={sess.id} className="border-[var(--border)] shadow-xs">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--foreground)]">
                          {sess.title}
                        </span>
                        <StatusBadge status={sess.status} />
                        {record && (
                          <StatusBadge status={record.status} className="text-[10px]" />
                        )}
                      </div>

                      {sess.description && (
                        <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                          {sess.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-foreground)] pt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {sess.date
                              ? new Date(sess.date).toLocaleDateString()
                              : 'TBA'}
                          </span>
                        </div>
                        {sess.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{sess.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8"
                          onClick={() => openFeedback(sess)}
                        >
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Rate Session
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Session Feedback"
        subtitle={`Rate ${selectedSession?.title} to help instructors improve delivery`}
        size="md"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <FormField label="Quality Rating (1 to 5 Stars)" required>
            <div className="flex items-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-[var(--muted-foreground)]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold ml-2 text-[var(--muted-foreground)]">
                {rating} / 5 Stars
              </span>
            </div>
          </FormField>

          <FormField label="Comments & Feedback (Optional)" hint="What went well? Any areas for clarification?">
            <Textarea
              rows={3}
              placeholder="Instructor explained concepts clearly, practical exercises were helpful..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submittingFeedback}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedbackModalOpen(false)}
              disabled={submittingFeedback}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submittingFeedback}>
              {submittingFeedback ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
