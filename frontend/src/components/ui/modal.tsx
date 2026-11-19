import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Max width class for the dialog panel */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
};

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    { isOpen, onClose, title, subtitle, icon, children, className, size = 'md' },
    ref
  ) => {
    // Close on Escape
    React.useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Lock body scroll
    React.useEffect(() => {
      if (isOpen) document.body.style.overflow = 'hidden';
      else document.body.style.overflow = '';
      return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Panel */}
        <div
          ref={ref}
          className={cn(
            'relative z-10 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-xl',
            sizeMap[size],
            className
          )}
        >
          {/* Header */}
          {(title || icon) && (
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-6">
              <div className="flex items-start gap-3">
                {icon && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-base font-semibold leading-tight text-[var(--foreground)]"
                    >
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X />
              </Button>
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';

export { Modal };

