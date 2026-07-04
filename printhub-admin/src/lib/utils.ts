import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    // Order status
    PLACED: 'badge-info',
    ACCEPTED: 'badge-info',
    PRINTING: 'badge-info',
    READY: 'badge-success',
    OUT_FOR_DELIVERY: 'badge-info',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-error',
    REJECTED: 'badge-error',
    // Shop status
    PENDING: 'badge-warning',
    APPROVED: 'badge-success',
    SUSPENDED: 'badge-error',
    // Payment status
    PAID: 'badge-success',
    PENDING: 'badge-warning',
    FAILED: 'badge-error',
    REFUNDED: 'badge-default',
  };
  return classes[status] || 'badge-default';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PLACED: 'Placed',
    ACCEPTED: 'Accepted',
    PRINTING: 'Printing',
    READY: 'Ready',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
    PENDING: 'Pending',
    APPROVED: 'Approved',
    SUSPENDED: 'Suspended',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
  };
  return labels[status] || status;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
