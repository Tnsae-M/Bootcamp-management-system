import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/common/Logo';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { getNavForRole, type NavSection, type NavItem } from '@/config/navigation';
import { useAppSelector } from '@/app/hooks';

export interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
  collapsed: boolean;
  onCollapseToggle: () => void;
}

function NavItemRow({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to.split('/').length <= 3}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
            : 'text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]',
          collapsed && 'justify-center px-2'
        )
      }
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}

function SidebarContent({
  sections,
  collapsed,
  onMobileClose,
}: {
  sections: NavSection[];
  collapsed: boolean;
  onMobileClose?: () => void;
}) {
  const user = useAppSelector((s) => s.auth.user);
  const activeRole = useAppSelector((s) => s.auth.activeRole);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-[var(--border)] px-4 shrink-0',
          collapsed && 'justify-center px-2'
        )}
      >
        <Logo size="sm" showText={!collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.section && !collapsed && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                {section.section}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavItemRow
                    item={item}
                    collapsed={collapsed}
                    onClick={onMobileClose}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-[var(--border)] p-3 space-y-2">
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg px-2 py-2',
            collapsed && 'justify-center'
          )}
        >
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
            {user?.fullName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {user?.fullName ?? user?.email ?? 'Guest'}
              </p>
              {activeRole && (
                <StatusBadge status={activeRole} className="mt-0.5 text-[10px]" />
              )}
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="px-2">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
}

function Sidebar({ mobileOpen, onMobileClose, collapsed, onCollapseToggle }: SidebarProps) {
  const activeRole = useAppSelector((s) => s.auth.activeRole);
  const sections = getNavForRole(activeRole);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 border-r border-[var(--border)] bg-[var(--card)] transition-[width] duration-200',
          collapsed ? 'w-[60px]' : 'w-64'
        )}
      >
        <SidebarContent sections={sections} collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={onCollapseToggle}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] shadow-sm hover:text-[var(--foreground)] transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border)] bg-[var(--card)] lg:hidden">
            <SidebarContent
              sections={sections}
              collapsed={false}
              onMobileClose={onMobileClose}
            />
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-4 rounded-md p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </aside>
        </>
      )}
    </>
  );
}

export { Sidebar };
