import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Clock,
  User,
  Activity,
  Search,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { auditService } from '@/services/index';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminAuditLog() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAuditTrail();
  }, []);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      const data = await auditService.getActivities(50);
      setActivities(data);
    } catch {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter((act) => {
    const term = searchQuery.toLowerCase();
    const actionMatch = (act.action || act.description || '').toLowerCase().includes(term);
    const userMatch = (act.user?.fullName || act.userId || '').toLowerCase().includes(term);
    return actionMatch || userMatch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Activity Audit Log"
        description="Immutable system event trail recording authentication, status transitions, and administrative overrides"
      />

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            placeholder="Filter audit events by action or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          Total Logged Events: <span className="font-semibold text-[var(--foreground)]">{filtered.length}</span>
        </p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="h-10 w-10" />}
          title="No Audit Records"
          description={
            searchQuery
              ? `No events match "${searchQuery}".`
              : 'Zero security or administrative audit records found.'
          }
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Event / Action</th>
                <th className="px-4 py-3 text-left font-semibold">Actor / Initiator</th>
                <th className="px-4 py-3 text-left font-semibold">Details / Payload</th>
                <th className="px-4 py-3 text-right font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {filtered.map((act, i) => (
                <tr key={act.id || i} className="hover:bg-[var(--accent)]/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    <span className="inline-flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-[var(--primary)] shrink-0" />
                      {act.action || act.description || 'System Operation'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    {act.user?.fullName || act.userId || 'System Automation'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono text-[11px] max-w-xs truncate">
                    {act.details ? JSON.stringify(act.details) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-[var(--muted-foreground)] whitespace-nowrap">
                    {act.createdAt ? new Date(act.createdAt).toLocaleString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
