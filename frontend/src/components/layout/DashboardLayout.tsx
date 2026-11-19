import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

const SIDEBAR_COLLAPSED_KEY = 'sidebar_collapsed';

function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleCollapseToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      } catch {}
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onCollapseToggle={handleCollapseToggle}
      />

      {/* Main area: offset for desktop sidebar */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-[padding-left] duration-200',
          collapsed ? 'lg:pl-[60px]' : 'lg:pl-64'
        )}
      >
        {/* Navbar */}
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          sidebarCollapsed={collapsed}
        />

        {/* Page content — padded below fixed navbar */}
        <main className="flex-1 pt-16 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { DashboardLayout };

