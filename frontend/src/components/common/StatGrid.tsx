import * as React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatItem {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  description?: string;
}

export interface StatGridProps {
  stats: StatItem[];
  className?: string;
  cols?: 2 | 3 | 4;
}

const colsMap: Record<NonNullable<StatGridProps['cols']>, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

function StatGrid({ stats, className, cols = 4 }: StatGridProps) {
  return (
    <div className={cn('grid gap-4', colsMap[cols], className)}>
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--muted-foreground)] truncate">
                  {stat.title}
                </p>
                <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </p>
                {stat.trend && (
                  <div className="mt-1 flex items-center gap-1">
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span
                      className={cn(
                        'text-xs font-medium',
                        stat.trend.isPositive
                          ? 'text-green-600'
                          : 'text-red-500'
                      )}
                    >
                      {stat.trend.value}
                    </span>
                  </div>
                )}
                {stat.description && (
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                    {stat.description}
                  </p>
                )}
              </div>
              {stat.icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                  {stat.icon}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { StatGrid };

