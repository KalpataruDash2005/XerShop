import { expect, test, describe } from 'vitest';
import { cn, formatCurrency, formatDate, getStatusColor, getStatusLabel } from '../../src/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    test('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    test('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    test('should handle Tailwind conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });
  });

  describe('formatCurrency', () => {
    test('should format number as INR', () => {
      const result = formatCurrency(100);
      expect(result).toContain('₹');
    });

    test('should handle decimal values', () => {
      const result = formatCurrency(99.99);
      expect(result).toContain('99.99');
    });

    test('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
  });

  describe('formatDate', () => {
    test('should format date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('Jan');
      expect(result).toContain('2024');
    });

    test('should format Date object', () => {
      const date = new Date(2024, 11, 25); // Dec 25, 2024
      const result = formatDate(date);
      expect(result).toContain('Dec');
      expect(result).toContain('2024');
    });
  });

  describe('getStatusColor', () => {
    test('should return correct color for PLACED', () => {
      expect(getStatusColor('PLACED')).toContain('blue');
    });

    test('should return correct color for COMPLETED', () => {
      expect(getStatusColor('COMPLETED')).toContain('emerald');
    });

    test('should return default color for unknown status', () => {
      expect(getStatusColor('UNKNOWN')).toContain('gray');
    });
  });

  describe('getStatusLabel', () => {
    test('should return human readable labels', () => {
      expect(getStatusLabel('PLACED')).toBe('Order Placed');
      expect(getStatusLabel('COMPLETED')).toBe('Completed');
      expect(getStatusLabel('OUT_FOR_DELIVERY')).toBe('Out for Delivery');
    });

    test('should return status itself for unknown', () => {
      expect(getStatusLabel('UNKNOWN')).toBe('UNKNOWN');
    });
  });
});
