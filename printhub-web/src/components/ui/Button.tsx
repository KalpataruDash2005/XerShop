'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary/50',
      secondary: 'bg-secondary text-white hover:bg-secondary-600 active:bg-secondary-700 focus:ring-secondary/50',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
      ghost: 'text-secondary hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300',
      accent: 'bg-accent text-secondary hover:bg-accent-400 active:bg-accent-500 focus:ring-accent/50',
      success: 'bg-success text-white hover:bg-success-600 active:bg-success-700 focus:ring-success/50',
      danger: 'bg-error text-white hover:bg-error-600 active:bg-error-700 focus:ring-error/50',
    };

    const sizes = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2.5',
      lg: 'text-lg px-6 py-3',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
