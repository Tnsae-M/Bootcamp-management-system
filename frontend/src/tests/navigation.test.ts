import { describe, it, expect } from 'vitest';
import { getNavForRole, getDashboardRoot, roleDashboardRoot } from '../config/navigation';

describe('Navigation Seam - getNavForRole', () => {
  it('returns admin navigation structure for SUPER_ADMIN', () => {
    const nav = getNavForRole('SUPER_ADMIN');
    expect(nav).toBeDefined();
    expect(nav.length).toBeGreaterThan(0);
    const allLabels = nav.flatMap((s) => s.items.map((i) => i.label));
    expect(allLabels).toContain('Dashboard');
    expect(allLabels).toContain('Divisions');
    expect(allLabels).toContain('Bootcamps');
    expect(allLabels).toContain('Users');
    expect(allLabels).toContain('Reports');
  });

  it('returns admin navigation structure for DIVISION_ADMIN', () => {
    const nav = getNavForRole('DIVISION_ADMIN');
    const allLabels = nav.flatMap((s) => s.items.map((i) => i.label));
    expect(allLabels).toContain('Divisions');
    expect(allLabels).toContain('Bootcamps');
  });

  it('returns instructor navigation structure for INSTRUCTOR', () => {
    const nav = getNavForRole('INSTRUCTOR');
    const allLabels = nav.flatMap((s) => s.items.map((i) => i.label));
    expect(allLabels).toContain('Teaching Hub');
    expect(allLabels).toContain('Sessions');
    expect(allLabels).toContain('Tasks');
    expect(allLabels).toContain('Submissions');
    expect(allLabels).toContain('Attendance');
  });

  it('returns student navigation structure for STUDENT', () => {
    const nav = getNavForRole('STUDENT');
    const allLabels = nav.flatMap((s) => s.items.map((i) => i.label));
    expect(allLabels).toContain('My Dashboard');
    expect(allLabels).toContain('Enrolled Bootcamps');
    expect(allLabels).toContain('Progress');
    expect(allLabels).toContain('Sessions');
    expect(allLabels).toContain('Tasks');
  });

  it('returns guest navigation for GUEST or missing role', () => {
    const guestNav = getNavForRole('GUEST');
    const allLabels = guestNav.flatMap((s) => s.items.map((i) => i.label));
    expect(allLabels).toContain('Available Bootcamps');
    expect(allLabels).toContain('My Applications');
    expect(allLabels).toContain('Profile');

    const fallbackNav = getNavForRole(null);
    expect(fallbackNav).toEqual(guestNav);
  });
});

describe('Navigation Seam - getDashboardRoot', () => {
  it('resolves correct root path for each canonical role', () => {
    expect(getDashboardRoot('SUPER_ADMIN')).toBe('/dashboard/admin');
    expect(getDashboardRoot('DIVISION_ADMIN')).toBe('/dashboard/admin');
    expect(getDashboardRoot('INSTRUCTOR')).toBe('/dashboard/instructor');
    expect(getDashboardRoot('STUDENT')).toBe('/dashboard/student');
    expect(getDashboardRoot('GUEST')).toBe('/dashboard/guest');
  });

  it('falls back to guest dashboard when role is undefined or invalid', () => {
    expect(getDashboardRoot(undefined)).toBe('/dashboard/guest');
    expect(getDashboardRoot('UNKNOWN_ROLE')).toBe('/dashboard/guest');
  });
});

