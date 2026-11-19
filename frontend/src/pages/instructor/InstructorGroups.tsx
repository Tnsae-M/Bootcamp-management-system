import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  Loader2,
  Shield,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { groupsService } from '@/services/groups.service';
import { bootcampsService } from '@/services/bootcamps.service';
import { enrollmentsService } from '@/services/enrollments.service';
import { Group, Bootcamp, Enrollment } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function InstructorGroups() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [selectedBootcampId, setSelectedBootcampId] = useState<string>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Group Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Member Modal
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState<Group | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [addingMember, setAddingMember] = useState(false);

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
        loadGroupData(firstId);
      }
    } catch {
      toast.error('Failed to load bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupData = async (bcId: string) => {
    try {
      const [grpList, enrList] = await Promise.all([
        groupsService.getGroupsByBootcamp(bcId).catch(() => []),
        enrollmentsService.getBootcampEnrollments(bcId, 'STUDENT').catch(() => []),
      ]);
      setGroups(grpList);
      setEnrollments(enrList);
      if (enrList.length > 0) {
        setSelectedUserId(enrList[0].userId);
      }
    } catch {
      toast.error('Failed to load group details');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !selectedBootcampId) return;

    setCreating(true);
    try {
      await groupsService.createGroup({
        bootcampId: selectedBootcampId,
        name: groupName.trim(),
      });
      toast.success('Project group created!');
      setCreateModalOpen(false);
      setGroupName('');
      loadGroupData(selectedBootcampId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGroup || !selectedUserId) return;

    setAddingMember(true);
    try {
      await groupsService.addMember(targetGroup.id, selectedUserId);
      toast.success('Member assigned to group!');
      setAddMemberModalOpen(false);
      loadGroupData(selectedBootcampId);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await groupsService.removeMember(groupId, userId);
      toast.success('Member removed from group');
      loadGroupData(selectedBootcampId);
    } catch {
      toast.error('Failed to remove member');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Group Management & Collaboration"
        description="Organize cohort students into capstone project teams and manage roster assignments"
        action={
          <Button size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create Group
          </Button>
        }
      />

      {/* Bootcamp Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-[var(--muted-foreground)]">Select Bootcamp:</span>
        <select
          value={selectedBootcampId}
          onChange={(e) => {
            setSelectedBootcampId(e.target.value);
            loadGroupData(e.target.value);
          }}
          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)]"
        >
          {bootcamps.map((bc) => (
            <option key={bc.id} value={bc.id}>
              {bc.title || bc.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No Groups Formed"
          description="There are currently no collaborative teams created for this bootcamp cohort."
          action={{
            label: 'Form First Group',
            onClick: () => setCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id} className="border-[var(--border)] shadow-xs flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold">{group.name}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => {
                      setTargetGroup(group);
                      setAddMemberModalOpen(true);
                    }}
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Add Student
                  </Button>
                </div>
                <CardDescription className="text-xs text-[var(--muted-foreground)]">
                  {group.members?.length || 0} students assigned
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="space-y-1.5 divide-y divide-[var(--border)]">
                  {group.members && group.members.length > 0 ? (
                    group.members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between pt-1.5 text-xs">
                        <div>
                          <p className="font-semibold text-[var(--foreground)]">
                            {m.user?.fullName || 'Student Member'}
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {m.user?.email} • {m.isLeader ? 'Lead' : 'Member'}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                          onClick={() => handleRemoveMember(group.id, m.userId)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[var(--muted-foreground)] italic py-2">
                      No members assigned to this group yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Project Group"
        subtitle="Specify team title for capstone collaboration"
        size="md"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <FormField label="Group Name" required>
            <Input
              placeholder="e.g. Cyber Squad Alpha / Team Dev-01"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={creating}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Create Group'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={addMemberModalOpen}
        onClose={() => setAddMemberModalOpen(false)}
        title={`Assign Student to ${targetGroup?.name}`}
        subtitle="Select an enrolled student to add to this team"
        size="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <FormField label="Enrolled Student" required>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full rounded-md border border-[var(--input)] bg-[var(--background)] p-2 text-sm text-[var(--foreground)]"
            >
              {enrollments.map((enr) => (
                <option key={enr.userId} value={enr.userId}>
                  {enr.user?.fullName || 'Student'} ({enr.user?.email})
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addingMember}>
              {addingMember ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Assign Member'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
