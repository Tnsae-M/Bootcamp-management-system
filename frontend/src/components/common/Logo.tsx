import * as React from 'react';
import { cn } from '@/lib/utils';
import logoSrc from '@/assets/images/logo.jpg';

export type LogoSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<LogoSize, { img: string; text: string }> = {
  sm: { img: 'h-7 w-7', text: 'text-sm' },
  md: { img: 'h-9 w-9', text: 'text-base' },
  lg: { img: 'h-12 w-12', text: 'text-lg' },
};

export interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const { img, text } = sizeMap[size];
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src={logoSrc}
        alt="CSEC-ASTU logo"
        className={cn('rounded-md object-cover', img)}
      />
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-bold text-[var(--foreground)]', text)}>
            CSEC-ASTU
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            Bootcamp
          </span>
        </div>
      )}
    </div>
  );
}

export { Logo };

