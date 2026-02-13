import { expect } from 'vitest';
import type { ValidationResult } from '../validation/types';

export const expectErrorToContain = <T extends (string | number)[]>(
  validation: ValidationResult,
  errorFunction: (...args: T) => string,
  ...args: T
): void => {
  if (validation.isValid) {
    throw new Error('Expected invalid validation result');
  }
  const expectedMessage = errorFunction(...args);
  expect(validation.errorMessage).toContain(expectedMessage);
};

export const expectErrorToMatch = <T extends (string | number)[]>(
  validation: ValidationResult,
  errorFunction: (...args: T) => string,
  ...args: T
): void => {
  if (validation.isValid) {
    throw new Error('Expected invalid validation result');
  }
  const expectedMessage = errorFunction(...args);
  expect(validation.errorMessage).toBe(expectedMessage);
};

export const normalizeLineNumbers = (message: string): string => {
  return message
    .replace(/\bon line \d+\b/g, 'on line <LINE>')
    .replace(/\bLine \d+\b/g, 'Line <LINE>')
    .replace(/lines: \d+(?:, \d+)*/g, 'lines: <LINE>')
    .replace(/line \d+:/g, 'line <LINE>:')
    .replace(/line \d+,/g, 'line <LINE>,')
    .replace(/line \d+\)/g, 'line <LINE>)')
    .replace(/line \d+\./g, 'line <LINE>.');
};

export const expectErrorToMatchIgnoringLineNumber = <T extends (string | number)[]>(
  validation: ValidationResult,
  errorFunction: (...args: T) => string,
  ...args: T
): void => {
  if (validation.isValid) {
    throw new Error('Expected invalid validation result');
  }
  const expectedMessage = errorFunction(...args);
  const normalizedExpected = normalizeLineNumbers(expectedMessage);
  const normalizedActual = normalizeLineNumbers(validation.errorMessage);
  expect(normalizedActual).toBe(normalizedExpected);
};
