import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, error, hint, className, children, htmlFor }, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={htmlFor}
            className="text-sm font-medium text-[var(--foreground)]"
          >
            {label}
            {required && (
              <span className="ml-1 text-[var(--destructive)]" aria-hidden>
                *
              </span>
            )}
          </label>
        )}
        {children}
        {hint && !error && (
          <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-[var(--destructive)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
FormField.displayName = 'FormField';

export { FormField };

