import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  LogOut,
  UserCircle,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout, setActiveRole } from '@/features/auth/authSlice';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { getDashboardRoot } from '@/config/navigation';
import { Button } from '@/components/ui/button';

export interface NavbarProps {
  onMenuClick: () => void;
  sidebarCollapsed: boolean;
}

function Navbar({ onMenuClick, sidebarCollapsed }: NavbarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const activeRole = useAppSelector((s) => s.auth.activeRole);

  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const roleMenuRef = React.useRef<HTMLDivElement>(null);

  // Available roles for this user
  const userRoles: string[] = React.useMemo(() => {
    const roles = user?.roles ?? [];
    return Array.from(new Set(roles.map((r: string) => r.toUpperCase())));
  }, [user]);

  const multiRole = userRoles.length > 1;

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleSwitchRole = (role: string) => {
    dispatch(setActiveRole(role));
    setRoleMenuOpen(false);
    navigate(getDashboardRoot(role), { replace: true });
  };

  const displayName = user?.fullName ?? user?.email ?? 'Guest';

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--border)] bg-[var(--background)] px-4 transition-[left] duration-200',
        // Push navbar right to account for sidebar width on desktop
        sidebarCollapsed ? 'lg:left-[60px]' : 'lg:left-64',
        'left-0'
      )}
    >
      {/* Hamburger (mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1">
        {/* Theme toggle — desktop only (mobile has it in sidebar) */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Notification bell */}
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Active role badge + role switcher */}
        {activeRole && (
          <div className="relative" ref={roleMenuRef}>
            <button
              onClick={() => multiRole && setRoleMenuOpen((v) => !v)}
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-xs',
                multiRole && 'hover:bg-[var(--accent)] cursor-pointer'
              )}
              aria-expanded={roleMenuOpen}
              aria-label="Switch role"
            >
              <StatusBadge status={activeRole} />
              {multiRole && <ChevronDown className="h-3 w-3 text-[var(--muted-foreground)]" />}
            </button>

            {multiRole && roleMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wide">
                  Switch Role
                </p>
                {userRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => handleSwitchRole(role)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                      role === activeRole
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                        : 'text-[var(--foreground)] hover:bg-[var(--accent)]'
                    )}
                  >
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                    {role.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User avatar menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            {initials}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg py-1">
              {/* User info */}
              <div className="border-b border-[var(--border)] px-3 py-2.5">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                  {displayName}
                </p>
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
              >
                <UserCircle className="h-4 w-4 text-[var(--muted-foreground)]" />
                Profile
              </button>

              <div className="border-t border-[var(--border)] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--accent)] transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export { Navbar };
