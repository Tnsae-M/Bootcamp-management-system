import { describe, it, expect } from 'vitest';
import { cn } from '../lib/utils';

describe('Utility - cn (clsx + tailwind-merge)', () => {
  it('combines multiple class names', () => {
    expect(cn('px-2', 'py-1', 'bg-blue-500')).toBe('px-2 py-1 bg-blue-500');
  });

  it('resolves conflicting tailwind utility classes properly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('bg-red-500', 'bg-blue-600')).toBe('bg-blue-600');
  });

  it('handles conditional falsy and boolean arguments', () => {
    const isPrimary = false;
    const isDense = true;
    expect(cn('base', isPrimary && 'text-primary', isDense && 'text-sm')).toBe('base text-sm');
  });
});

