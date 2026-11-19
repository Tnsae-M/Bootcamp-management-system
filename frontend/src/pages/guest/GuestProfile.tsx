import React, { useState } from 'react';
import {
  User,
  Mail,
  School,
  Send,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/app/hooks';
import { authService } from '@/services/auth.service';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';

export default function GuestProfile() {
  const user = useAppSelector((s) => s.auth.user);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (!newPassword) {
      setPasswordError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Your password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update password. Verify current password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const userRoles = user?.roles ?? ['GUEST'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your identity credentials, university affiliation, and account security"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-[var(--border)] shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-[var(--primary-foreground)]">
                  {user?.fullName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">
                    {user?.fullName || 'User Profile'}
                  </CardTitle>
                  <CardDescription className="text-xs text-[var(--muted-foreground)]">
                    {user?.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3 divide-y divide-[var(--border)]">
                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <User className="h-4 w-4" />
                    <span>Full Name</span>
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{user?.fullName || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <Mail className="h-4 w-4" />
                    <span>Email Address</span>
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{user?.email || '—'}</span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <School className="h-4 w-4" />
                    <span>University ID</span>
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{user?.universityId || 'Not provided'}</span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <Building className="h-4 w-4" />
                    <span>Department</span>
                  </div>
                  <span className="font-medium text-[var(--foreground)]">{user?.department || 'Not provided'}</span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <Send className="h-4 w-4" />
                    <span>Telegram Handle</span>
                  </div>
                  <span className="font-medium text-[var(--foreground)]">
                    {user?.telegramUsername ? `@${user.telegramUsername}` : 'Not provided'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <Shield className="h-4 w-4" />
                    <span>Email Verification</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Verified
                  </span>
                </div>

                <div className="py-2.5 text-sm space-y-2">
                  <div className="flex items-center gap-2 text-[var(--muted-foreground)] text-xs">
                    <Shield className="h-4 w-4" />
                    <span>Assigned Permissions & Roles</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {userRoles.map((role) => (
                      <StatusBadge key={role} status={role} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-[var(--border)] shadow-xs">
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-[var(--primary)]" />
                <CardTitle className="text-lg font-bold">Account Security</CardTitle>
              </div>
              <CardDescription className="text-xs text-[var(--muted-foreground)]">
                Update your login password regularly to protect your BMS access
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <FormField label="Current Password" required htmlFor="currentPassword">
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={changingPassword}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>

                <FormField label="New Password" required hint="Minimum 8 characters" htmlFor="newPassword">
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNew ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changingPassword}
                      className="pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-2.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>

                <FormField label="Confirm New Password" required htmlFor="confirmPassword">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={changingPassword}
                  />
                </FormField>

                <div className="pt-2">
                  <Button type="submit" disabled={changingPassword} className="w-full">
                    {changingPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
