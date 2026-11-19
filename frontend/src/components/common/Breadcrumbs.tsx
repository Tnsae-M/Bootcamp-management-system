import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbsProps {
  /** Override auto-generated items with explicit ones */
  items?: BreadcrumbItem[];
  className?: string;
}

/**
 * When `items` is not provided, the component reads the current pathname and
 * generates segments from it, turning route segments into human-readable labels.
 *
 * Example: /dashboard/admin/bootcamps  →  Home > Admin > Bootcamps
 */
function toLabel(segment: string): string {
  return segment
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const location = useLocation();

  const resolved: BreadcrumbItem[] = items ?? [
    { label: 'Home', to: '/' },
    ...location.pathname
      .split('/')
      .filter(Boolean)
      .map((seg, i, arr) => ({
        label: toLabel(seg),
        to: i < arr.length - 1 ? '/' + arr.slice(0, i + 1).join('/') : undefined,
      })),
  ];

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center', className)}>
      <ol className="flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
        {resolved.map((item, i) => {
          const isLast = i === resolved.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i === 0 && (
                <Home className="h-3.5 w-3.5 shrink-0 mr-0.5" aria-hidden />
              )}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="hover:text-[var(--foreground)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast && 'font-medium text-[var(--foreground)]'
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export { Breadcrumbs };

