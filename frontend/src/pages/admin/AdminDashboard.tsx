import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  BookOpen,
  Users,
  ClipboardList,
  BarChart3,
  ShieldAlert,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { divisionsService } from '@/services/divisions.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { usersService } from '@/services/users.service';
import { auditService } from '@/services/index';
import { Division, Bootcamp, User } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatGrid, StatItem } from '@/components/common/StatGrid';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminMetrics();
  }, []);

  const loadAdminMetrics = async () => {
    setLoading(true);
    try {
      const [divList, bcList, userList, actList] = await Promise.all([
        divisionsService.getDivisions().catch(() => []),
        bootcampsService.getBootcamps().catch(() => []),
        usersService.getUsers().catch(() => []),
        auditService.getActivities(5).catch(() => []),
      ]);
      setDivisions(divList);
      setBootcamps(bcList);
      setUsers(userList);
      setActivities(actList);
    } catch {
      toast.error('Failed to load system administration metrics');
    } finally {
      setLoading(false);
    }
  };

  const activeBootcamps = bootcamps.filter(
    (b) => b.status?.toUpperCase() === 'ACTIVE' || b.status?.toUpperCase() === 'OPEN'
  );

  const stats: StatItem[] = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: 'Registered student & instructor accounts',
    },
    {
      title: 'Active Divisions',
      value: divisions.length,
      icon: <Layers className="h-5 w-5 text-purple-500" />,
      description: 'CSEC-ASTU specialized tracks',
    },
    {
      title: 'Total Cohorts',
      value: bootcamps.length,
      icon: <BookOpen className="h-5 w-5 text-indigo-500" />,
      description: `${activeBootcamps.length} open or running`,
    },
    {
      title: 'System Health',
      value: 'Operational',
      icon: <Activity className="h-5 w-5 text-green-500" />,
      description: 'Audit logs and services active',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="Global system administration, cohort lifecycle governance, and division oversight"
        action={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => navigate('/dashboard/admin/bootcamps')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Bootcamp
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/admin/divisions')}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Division
            </Button>
          </div>
        }
      />

      <StatGrid stats={stats} cols={4} />

      {/* Main Grid: Divisions Overview + Recent Audit Events */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Divisions Card */}
        <div className="lg:col-span-6">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">CSEC-ASTU Divisions</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Organized tracks and curriculum pillars
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/dashboard/admin/divisions')}
              >
                Manage
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : divisions.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                  No divisions configured in the system.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {divisions.slice(0, 4).map((div) => {
                    const count = bootcamps.filter((b) => b.divisionId === div.id).length;
                    return (
                      <div
                        key={div.id}
                        className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">{div.name}</p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            Slug: {div.slug} • {count} active cohorts
                          </p>
                        </div>
                        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold text-[var(--muted-foreground)]">
                          ACTIVE
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/dashboard/admin/bootcamps')}
              >
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                Browse All Cohorts & Programs
              </Button>
            </div>
          </Card>
        </div>

        {/* Audit Log Preview */}
        <div className="lg:col-span-6">
          <Card className="border-[var(--border)] shadow-xs h-full flex flex-col justify-between">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Recent System Activity</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Live audit trail of security and administrative operations
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => navigate('/dashboard/admin/audit-log')}
              >
                Full audit
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : activities.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
                  No administrative events logged yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activities.map((act, i) => (
                    <div
                      key={act.id || i}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-2.5 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[var(--foreground)]">
                          {act.action || act.description || 'System Event'}
                        </p>
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          User: {act.user?.fullName || act.userId || 'System'}
                        </p>
                      </div>
                      <span className="text-[11px] text-[var(--muted-foreground)]">
                        {act.createdAt ? new Date(act.createdAt).toLocaleTimeString() : 'Recent'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <div className="p-3 border-t border-[var(--border)]">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => navigate('/dashboard/admin/users')}
              >
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Manage User Access & Roles
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
