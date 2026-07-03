'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-secondary placeholder:text-slate-400 transition-all duration-200',
            'focus:border-primary focus:ring-2 focus:ring-primary/20',
            error && 'border-error focus:border-error focus:ring-error/20',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
        {helper && !error && <p className="mt-1.5 text-sm text-slate-400">{helper}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
