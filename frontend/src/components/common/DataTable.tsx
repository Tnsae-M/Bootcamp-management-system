import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import { FileSearch } from 'lucide-react';

export interface ColumnDef<T> {
  header: string;
  accessor: keyof T | string;
  cell?: (value: unknown, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  keyExtractor?: (row: T, index: number) => string;
}

function getNestedValue<T>(obj: T, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  emptyTitle = 'No data found',
  emptyDescription,
  className,
  rowClassName,
  onRowClick,
  keyExtractor,
}: DataTableProps<T>) {
  const skeletonRows = 5;

  return (
    <div className={cn('w-full overflow-auto rounded-lg border border-[var(--border)]', className)}>
      <table className="w-full text-sm">
        <thead className="border-b border-[var(--border)] bg-[var(--muted)]">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]',
                  col.headerClassName
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, ri) => (
              <tr key={ri}>
                {columns.map((_, ci) => (
                  <td key={ci} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                <EmptyState
                  icon={<FileSearch className="h-8 w-8" />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </td>
            </tr>
          ) : (
            data.map((row, ri) => {
              const key = keyExtractor ? keyExtractor(row, ri) : String(ri);
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-[var(--accent)]',
                    rowClassName ? rowClassName(row, ri) : ''
                  )}
                >
                  {columns.map((col, ci) => {
                    const rawValue = getNestedValue(row, col.accessor as string);
                    return (
                      <td
                        key={ci}
                        className={cn(
                          'px-4 py-3 text-[var(--foreground)]',
                          col.className
                        )}
                      >
                        {col.cell
                          ? col.cell(rawValue, row, ri)
                          : rawValue !== undefined && rawValue !== null
                          ? String(rawValue)
                          : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export { DataTable };

