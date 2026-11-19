import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Plus,
  Trash2,
  FileText,
  Loader2,
  TrendingUp,
  Download,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { reportsService } from '@/services/reports.service';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [repList, analData] = await Promise.all([
        reportsService.getReports().catch(() => []),
        reportsService.getAnalytics().catch(() => null),
      ]);
      setReports(repList);
      setAnalytics(analData);
    } catch {
      toast.error('Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Report title and summary content are required');
      return;
    }

    setCreating(true);
    try {
      await reportsService.createReport({
        title: title.trim(),
        content: content.trim(),
      });
      toast.success('Report archived successfully!');
      setCreateModalOpen(false);
      setTitle('');
      setContent('');
      loadReportsData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to archive report');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reportsService.deleteReport(id);
      toast.success('Report removed');
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      toast.error('Failed to delete report');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohort Analytics & Reports"
        description="Comprehensive division metrics, attendance integrity summaries, and graduation audit logs"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Archive New Report
          </Button>
        }
      />

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[var(--border)] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Overall Attendance Health</CardDescription>
            <CardTitle className="text-2xl font-bold">89.4%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[var(--muted-foreground)]">Across all active divisions</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Deliverable Turn-in Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">92.1%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[var(--muted-foreground)]">On-time laboratory solutions</p>
          </CardContent>
        </Card>

        <Card className="border-[var(--border)] shadow-xs">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Induction Readiness Index</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">84.0%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[11px] text-[var(--muted-foreground)]">Passing aggregate 75% threshold</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div>
        <h3 className="text-base font-bold mb-3 text-[var(--foreground)]">Published Cohort Reports</h3>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </Card>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<BarChart3 className="h-10 w-10" />}
            title="No Reports Generated"
            description="Archive your first division graduation report or audit summary."
            action={{
              label: 'Archive Report',
              onClick: () => setCreateModalOpen(true),
            }}
          />
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <Card key={rep.id} className="border-[var(--border)] shadow-xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-[var(--primary)]" />
                      <span className="font-bold text-sm text-[var(--foreground)]">{rep.title}</span>
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                      {rep.content}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] pt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Archived'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleDelete(rep.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Archive Cohort Audit Report"
        subtitle="Save periodic division evaluations or final graduation audit records"
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <FormField label="Report Title" required>
            <Input
              placeholder="e.g. Competitive Programming Winter 2026 Induction Audit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <FormField label="Audit Summary & Recommendations" required>
            <Textarea
              rows={4}
              placeholder="Induction outcomes, percentage of students reaching criteria, capstone feedback..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Save Report'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
