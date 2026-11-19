import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Bell,
  FolderKanban,
  Layers,
  ClipboardList,
  CheckSquare,
  UserCheck,
  Group,
  Library,
  GraduationCap,
  ListChecks,
  TrendingUp,
  Briefcase,
  FileText,
  Search,
  UserCircle,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types/user';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Optional badge count key from uiSlice or similar */
  badgeKey?: string;
  children?: NavItem[];
}

export interface NavSection {
  section?: string;
  items: NavItem[];
}

export type RoleNavMap = Record<string, NavSection[]>;

// ---------------------------------------------------------------------------
// Admin / Super-Admin / Division-Admin nav
// ---------------------------------------------------------------------------
const adminNav: NavSection[] = [
  {
    items: [
      { label: 'Dashboard',      to: '/dashboard/admin',              icon: LayoutDashboard },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Divisions',      to: '/dashboard/admin/divisions',    icon: Layers },
      { label: 'Bootcamps',      to: '/dashboard/admin/bootcamps',    icon: BookOpen },
      { label: 'Users',          to: '/dashboard/admin/users',        icon: Users },
      { label: 'Enrollments',    to: '/dashboard/admin/enrollments',  icon: ClipboardList },
    ],
  },
  {
    section: 'Analytics',
    items: [
      { label: 'Reports',        to: '/dashboard/admin/reports',      icon: BarChart3 },
      { label: 'Audit Log',      to: '/dashboard/admin/audit-log',    icon: ShieldAlert },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Notifications',  to: '/dashboard/admin/notifications', icon: Bell, badgeKey: 'unreadNotifications' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Instructor nav
// ---------------------------------------------------------------------------
const instructorNav: NavSection[] = [
  {
    items: [
      { label: 'Teaching Hub',   to: '/dashboard/instructor',                icon: LayoutDashboard },
    ],
  },
  {
    section: 'Teaching',
    items: [
      { label: 'Sessions',       to: '/dashboard/instructor/sessions',       icon: FolderKanban },
      { label: 'Tasks',          to: '/dashboard/instructor/tasks',          icon: CheckSquare },
      { label: 'Submissions',    to: '/dashboard/instructor/submissions',    icon: FileText },
      { label: 'Attendance',     to: '/dashboard/instructor/attendance',     icon: UserCheck },
    ],
  },
  {
    section: 'Collaboration',
    items: [
      { label: 'Groups',         to: '/dashboard/instructor/groups',         icon: Group },
      { label: 'Resources',      to: '/dashboard/instructor/resources',      icon: Library },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Notifications',  to: '/dashboard/instructor/notifications',  icon: Bell, badgeKey: 'unreadNotifications' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Student nav
// ---------------------------------------------------------------------------
const studentNav: NavSection[] = [
  {
    items: [
      { label: 'My Dashboard',       to: '/dashboard/student',                   icon: LayoutDashboard },
    ],
  },
  {
    section: 'Learning',
    items: [
      { label: 'Enrolled Bootcamps', to: '/dashboard/student/bootcamps',         icon: BookOpen },
      { label: 'Sessions',           to: '/dashboard/student/sessions',          icon: FolderKanban },
      { label: 'Tasks',              to: '/dashboard/student/tasks',             icon: ListChecks },
      { label: 'Progress',           to: '/dashboard/student/progress',          icon: TrendingUp },
    ],
  },
  {
    section: 'Collaboration',
    items: [
      { label: 'Groups',             to: '/dashboard/student/groups',            icon: Group },
      { label: 'Resources',          to: '/dashboard/student/resources',         icon: Library },
    ],
  },
  {
    section: 'Communication',
    items: [
      { label: 'Notifications',      to: '/dashboard/student/notifications',     icon: Bell, badgeKey: 'unreadNotifications' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Guest nav
// ---------------------------------------------------------------------------
const guestNav: NavSection[] = [
  {
    items: [
      { label: 'Available Bootcamps', to: '/dashboard/guest',                icon: Search },
      { label: 'My Applications',     to: '/dashboard/guest/applications',   icon: Briefcase },
      { label: 'Profile',             to: '/dashboard/guest/profile',        icon: UserCircle },
    ],
  },
];

// ---------------------------------------------------------------------------
// Role → nav map
// ---------------------------------------------------------------------------
export const roleNavMap: RoleNavMap = {
  SUPER_ADMIN:    adminNav,
  DIVISION_ADMIN: adminNav,
  INSTRUCTOR:     instructorNav,
  STUDENT:        studentNav,
  GUEST:          guestNav,
};

/** Returns nav sections for the given active role string. */
export function getNavForRole(role: string | null | undefined): NavSection[] {
  if (!role) return guestNav;
  return roleNavMap[role.toUpperCase()] ?? guestNav;
}

/** Canonical route prefix for each role portal */
export const roleDashboardRoot: Record<string, string> = {
  SUPER_ADMIN:    '/dashboard/admin',
  DIVISION_ADMIN: '/dashboard/admin',
  INSTRUCTOR:     '/dashboard/instructor',
  STUDENT:        '/dashboard/student',
  GUEST:          '/dashboard/guest',
};

export function getDashboardRoot(role: string | null | undefined): string {
  if (!role) return '/dashboard/guest';
  return roleDashboardRoot[role.toUpperCase()] ?? '/dashboard/guest';
}

