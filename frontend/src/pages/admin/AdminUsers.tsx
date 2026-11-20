import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Shield,
  KeyRound,
  Edit2,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersService } from '@/services/users.service';
import { User } from '@/types';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

const AVAILABLE_ROLES = [
  'SUPER_ADMIN',
  'DIVISION_ADMIN',
  'INSTRUCTOR',
  'STUDENT',
  'GUEST',
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Roles Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [updatingRoles, setUpdatingRoles] = useState(false);

  // Admin Reset Password Modal
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPwd, setResettingPwd] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const openRolesModal = (u: User) => {
    setSelectedUser(u);
    setUserRoles(u.roles?.map((r) => r.toUpperCase()) || ['GUEST']);
    setRoleModalOpen(true);
  };

  const handleRoleToggle = (role: string) => {
    setUserRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleRolesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (userRoles.length === 0) {
      toast.error('A user must have at least one assigned role');
      return;
    }

    setUpdatingRoles(true);
    try {
      await usersService.updateRoles(selectedUser.id, userRoles);
      toast.success(`Roles updated for ${selectedUser.fullName}`);
      setRoleModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update user roles');
    } finally {
      setUpdatingRoles(false);
    }
  };

  const openPwdModal = (u: User) => {
    setSelectedUser(u);
    setNewPassword('');
    setPwdModalOpen(true);
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) {
      toast.error('Password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setResettingPwd(true);
    try {
      await usersService.adminResetPassword(selectedUser.id, newPassword.trim());
      toast.success(`Password reset for ${selectedUser.fullName}`);
      setPwdModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResettingPwd(false);
    }
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.universityId || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      u.roles?.some((r) => r.toUpperCase() === roleFilter);

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access & Role Governance"
        description="Audit student accounts, provision instructor rights, and execute mediated credential resets"
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs text-[var(--foreground)]"
          >
            <option value="ALL">All Roles</option>
            {AVAILABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          Showing {filtered.length} of {users.length} registered accounts
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
          icon={<Users className="h-10 w-10" />}
          title="No Users Found"
          description="Zero user accounts match your filter criteria."
        />
      ) : (
        <div className="rounded-lg border border-[var(--border)] overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-[var(--muted)] border-b border-[var(--border)] text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">University ID</th>
                <th className="px-4 py-3 text-left font-semibold">Department</th>
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {filtered.map((u, userIdx) => (
                <tr key={u.id || u._id || `user-${userIdx}`} className="hover:bg-[var(--accent)]/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                    {u.fullName || u.name || 'User'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">{u.email}</td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)] font-mono">
                    {u.universityId || '—'}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {u.department || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(new Set(u.roles || [])).map((r, roleIdx) => (
                        <StatusBadge
                          key={`${u.id || u._id || userIdx}-${r}-${roleIdx}`}
                          status={r}
                          className="text-[10px]"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => openRolesModal(u)}
                    >
                      <Shield className="mr-1 h-3 w-3" />
                      Roles
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs px-2 text-amber-600 dark:text-amber-400"
                      onClick={() => openPwdModal(u)}
                    >
                      <KeyRound className="mr-1 h-3 w-3" />
                      Reset Pwd
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Roles Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title={`Assign Roles: ${selectedUser?.fullName}`}
        subtitle="Configure system-level permissions and access scopes"
        size="md"
      >
        <form onSubmit={handleRolesSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Select Granted Roles:
            </p>
            <div className="space-y-2">
              {AVAILABLE_ROLES.map((role) => {
                const checked = userRoles.includes(role);
                return (
                  <label
                    key={role}
                    className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer text-xs transition-colors ${
                      checked
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 font-semibold text-[var(--foreground)]'
                        : 'border-[var(--border)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    <span>{role.replace(/_/g, ' ')}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleRoleToggle(role)}
                      className="rounded border-[var(--border)]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setRoleModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updatingRoles}>
              {updatingRoles ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Save Roles'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={pwdModalOpen}
        onClose={() => setPwdModalOpen(false)}
        title={`Reset Password: ${selectedUser?.fullName}`}
        subtitle="Set a new temporary or permanent password for this account"
        size="md"
      >
        <form onSubmit={handlePwdSubmit} className="space-y-4">
          <FormField label="New Password" required hint="Minimum 8 characters">
            <Input
              type="text"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={resettingPwd}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setPwdModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={resettingPwd}>
              {resettingPwd ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : 'Confirm Reset'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
