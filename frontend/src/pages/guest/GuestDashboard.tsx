import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Calendar,
  Layers,
  Send,
  Loader2,
  BookOpen,
  Award,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { bootcampsService } from '@/services/bootcamps.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { Bootcamp, Enrollment } from '@/types';
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

export default function GuestDashboard() {
  const navigate = useNavigate();

  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Apply Modal state
  const [selectedBootcamp, setSelectedBootcamp] = useState<Bootcamp | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Application form fields
  const [motivation, setMotivation] = useState('');
  const [experience, setExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bcList, enrList] = await Promise.all([
        bootcampsService.getBootcamps(),
        enrollmentsService.getMyEnrollments().catch(() => []),
      ]);
      setBootcamps(bcList);
      setMyEnrollments(enrList);
    } catch {
      toast.error('Failed to load bootcamps catalogue');
    } finally {
      setLoading(false);
    }
  };

  const appliedBootcampIds = new Set(myEnrollments.map((e) => e.bootcampId));

  const filteredBootcamps = bootcamps.filter((bc) => {
    const titleMatch = (bc.title || bc.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const divMatch = bc.division?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || divMatch;
  });

  const handleOpenApply = (bc: Bootcamp) => {
    setSelectedBootcamp(bc);
    setMotivation('');
    setExperience('');
    setPortfolioUrl('');
    setFormError(null);
    setApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBootcamp) return;

    if (!motivation.trim()) {
      setFormError('Please provide a brief statement of motivation');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await enrollmentsService.createEnrollment({
        bootcampId: selectedBootcamp.id,
        motivation: motivation.trim(),
        experience: experience.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
      });

      toast.success(`Application submitted for ${selectedBootcamp.title || selectedBootcamp.name}!`);
      setApplyModalOpen(false);
      // Reload user enrollments
      const updated = await enrollmentsService.getMyEnrollments();
      setMyEnrollments(updated);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit application. Please try again.';
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Available Bootcamps"
        description="Explore active cohort programs across CSEC-ASTU divisions and submit your enrollment application"
        action={
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/guest/applications')}>
            View My Applications ({myEnrollments.length})
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Search bootcamps or tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-xs text-[var(--muted-foreground)] self-start sm:self-center">
          Showing {filteredBootcamps.length} of {bootcamps.length} bootcamps
        </p>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="space-y-4 p-6">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex justify-between pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredBootcamps.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-10 w-10" />}
          title="No Bootcamps Found"
          description={
            searchQuery
              ? `No bootcamp programs match "${searchQuery}". Try a different keyword.`
              : 'There are currently no scheduled bootcamps in the catalogue.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBootcamps.map((bc) => {
            const hasApplied = appliedBootcampIds.has(bc.id);
            const isOpen = bc.status?.toUpperCase() === 'OPEN';

            return (
              <Card key={bc.id} className="flex flex-col justify-between hover:border-[var(--primary)]/40 transition-colors shadow-xs">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {bc.division?.name ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-[var(--accent-foreground)]">
                        <Layers className="h-3 w-3" />
                        {bc.division.name}
                      </span>
                    ) : (
                      <span />
                    )}
                    <StatusBadge status={bc.status} />
                  </div>

                  <CardTitle className="text-lg font-bold line-clamp-1">
                    {bc.title || bc.name}
                  </CardTitle>

                  <CardDescription className="line-clamp-2 text-xs text-[var(--muted-foreground)] mt-1">
                    {bc.description || 'Intensive, structured training program developed by CSEC-ASTU instructors.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 py-2 text-xs">
                  {/* Timeline */}
                  {(bc.startDate || bc.endDate) && (
                    <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {bc.startDate ? new Date(bc.startDate).toLocaleDateString() : 'TBA'}
                        {' — '}
                        {bc.endDate ? new Date(bc.endDate).toLocaleDateString() : 'TBA'}
                      </span>
                    </div>
                  )}

                  {/* Weights info */}
                  <div className="rounded-lg bg-[var(--muted)]/50 p-2.5 border border-[var(--border)]">
                    <div className="flex items-center gap-1 text-[var(--muted-foreground)] font-semibold mb-1.5 text-[11px]">
                      <Award className="h-3 w-3 text-amber-500" />
                      Induction Evaluation Criteria
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-[var(--muted-foreground)]">
                      <div>Attendance: <span className="font-semibold text-[var(--foreground)]">{bc.attendanceWeight}%</span></div>
                      <div>Tasks: <span className="font-semibold text-[var(--foreground)]">{bc.individualTaskWeight}%</span></div>
                      <div>Milestones: <span className="font-semibold text-[var(--foreground)]">{bc.groupMilestoneWeight}%</span></div>
                      <div>Peer Review: <span className="font-semibold text-[var(--foreground)]">{bc.peerReviewWeight}%</span></div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 border-t border-[var(--border)]">
                  {hasApplied ? (
                    <div className="flex w-full items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Application Submitted
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard/guest/applications')}
                      >
                        Status
                      </Button>
                    </div>
                  ) : isOpen ? (
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => handleOpenApply(bc)}
                    >
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                      Apply for Cohort
                    </Button>
                  ) : (
                    <Button variant="secondary" className="w-full" size="sm" disabled>
                      Applications Closed
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => !submitting && setApplyModalOpen(false)}
        title={`Apply: ${selectedBootcamp?.title || selectedBootcamp?.name}`}
        subtitle="Submit your application details for division screening"
        size="lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-500/10 p-3 text-xs text-red-600 border border-red-500/20">
              {formError}
            </div>
          )}

          <FormField
            label="Statement of Motivation"
            required
            hint="Why do you wish to join this bootcamp and what are your learning goals?"
          >
            <Textarea
              rows={3}
              placeholder="Explain your interest in this specialization track and your commitment to completing assignments..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="Prior Experience or Background"
            hint="Any relevant programming languages, tools, courses, or projects (optional)"
          >
            <Textarea
              rows={2}
              placeholder="e.g. Basic knowledge of C++, completed introductory web dev, familiarity with Linux..."
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              disabled={submitting}
            />
          </FormField>

          <FormField
            label="GitHub / Portfolio / Profile Link"
            hint="Optional link to your code repository or personal profile"
          >
            <div className="relative">
              <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="https://github.com/your-username"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="pl-9"
                disabled={submitting}
              />
            </div>
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setApplyModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
