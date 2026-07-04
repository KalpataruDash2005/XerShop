export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PLACED: '#2563EB',
    ACCEPTED: '#6366F1',
    REJECTED: '#DC2626',
    PRINTING: '#9333EA',
    READY: '#16A34A',
    OUT_FOR_DELIVERY: '#0891B2',
    COMPLETED: '#15803D',
    CANCELLED: '#64748B',
  };
  return colors[status] || '#64748B';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PLACED: 'Order Placed',
    ACCEPTED: 'Accepted',
    REJECTED: 'Rejected',
    PRINTING: 'Printing',
    READY: 'Ready',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
