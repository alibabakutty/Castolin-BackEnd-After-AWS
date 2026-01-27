// tests/unit/utils/helpers.spec.js
import { test, expect } from '@playwright/test';
import { toOracleDate, validateEmail, generateOrderNumber } from '../../../utils/helpers.js';

test.describe('Helper Functions', () => {
  test('toOracleDate should handle string dates', () => {
    const result = toOracleDate('2024-01-15');
    expect(result).toBeInstanceOf(Date);
  });

  test('toOracleDate should return null for invalid input', () => {
    expect(toOracleDate('invalid-date')).toBeNull();
    expect(toOracleDate(null)).toBeNull();
  });

  test('validateEmail should return true for valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.in')).toBe(true);
  });

  test('validateEmail should return false for invalid emails', () => {
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@domain.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
  });

  test('generateOrderNumber should create unique numbers', () => {
    const orderNum1 = generateOrderNumber();
    const orderNum2 = generateOrderNumber(orderNum1); // pass previous

    expect(orderNum1).toMatch(/SQ-\d{2}-\d{2}-\d{2}-\d{4}/);
    expect(orderNum2).toMatch(/SQ-\d{2}-\d{2}-\d{2}-\d{4}/);
    expect(orderNum2).not.toBe(orderNum1);
  });
});
