import React, { useEffect, useState } from 'react';
import {
  Users,
  Shield,
  UserCheck,
  FolderGit2,
  Mail,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { enrollmentsService } from '@/services/enrollments.service';
import { groupsService } from '@/services/groups.service';
import { useAppSelector } from '@/app/hooks';
import { Group, Enrollment } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentGroups() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const enrList = await enrollmentsService.getMyEnrollments();
      const valid = enrList.filter(
        (e) => e.status?.toUpperCase() === 'STUDENT' || e.status?.toUpperCase() === 'INDUCTED'
      );
      setEnrollments(valid.length > 0 ? valid : enrList);

      if (valid.length > 0 || enrList.length > 0) {
        const bcId = (valid[0] || enrList[0]).bootcampId;
        const groupList = await groupsService.getGroupsByBootcamp(bcId);
        setGroups(groupList);
      }
    } catch {
      toast.error('Failed to load group allocations');
    } finally {
      setLoading(false);
    }
  };

  // Find user's assigned group
  const myGroup = groups.find((g) =>
    g.members?.some((m) => m.userId === currentUser?.id || m.userId === currentUser?._id)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Groups & Teammates"
        description="Collaborate with your cohort peers on team deliverables, code reviews, and capstone milestones"
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No Groups Formed Yet"
          description="Division instructors have not finalized team allocations for your cohort."
        />
      ) : (
        <div className="space-y-6">
          {/* My Assigned Group Banner if found */}
          {myGroup ? (
            <Card className="border-[var(--primary)]/40 shadow-xs bg-gradient-to-r from-blue-500/5 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--primary-foreground)]">
                    <Sparkles className="h-3 w-3" />
                    Your Team
                  </span>
                </div>
                <CardTitle className="text-2xl font-bold">{myGroup.name}</CardTitle>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  Capstone Collaboration Unit
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
                    Team Members ({myGroup.members?.length || 0})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {myGroup.members?.map((member, i) => {
                      const isMe = member.userId === currentUser?.id || member.userId === currentUser?._id;
                      return (
                        <div
                          key={member.id || i}
                          className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-2.5 text-xs"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-[var(--accent-foreground)]">
                            {member.user?.fullName?.[0] || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-[var(--foreground)] truncate">
                              {member.user?.fullName || 'Teammate'} {isMe && '(You)'}
                            </p>
                            <p className="text-[11px] text-[var(--muted-foreground)] truncate">
                              {member.isLeader ? 'Team Lead' : 'Member'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-400">
              <p className="font-semibold mb-0.5">Not Assigned to a Team</p>
              <p>You have not been assigned to a project group yet. Contact your division instructor for placement.</p>
            </div>
          )}

          {/* All Cohort Groups */}
          <div>
            <h3 className="text-base font-bold mb-3 text-[var(--foreground)]">Cohort Teams Catalogue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((g) => (
                <Card key={g.id} className="border-[var(--border)] shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold">{g.name}</CardTitle>
                    <CardDescription className="text-xs text-[var(--muted-foreground)]">
                      {g.members?.length || 0} enrolled members
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {g.members?.map((m, idx) => (
                        <span
                          key={m.id || idx}
                          className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]"
                        >
                          {m.user?.fullName || `Member ${idx + 1}`}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
