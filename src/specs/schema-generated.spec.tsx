import { describe, it, expect } from 'vitest';
import { validate } from '../index';
import { allSchemas } from '../schemaRegistry/schemaMap';
import { generateTestCases } from '../__tests__/generators/schemaTestGenerator';
import { normalizeLineNumbers } from '../errors/testHelpers';

describe('Schema-generated tests', () => {
  const schemas = allSchemas;

  schemas.forEach((schema) => {
    const testCases = generateTestCases(schema);
    if (testCases.length === 0) {
      return;
    }

    describe(`Schema: ${schema.name}`, () => {
      const validCases = testCases.filter((tc) => tc.expectedValid);
      const invalidCases = testCases.filter((tc) => !tc.expectedValid);

      if (validCases.length > 0) {
        describe('Valid cases', () => {
          validCases.forEach((testCase) => {
            it(testCase.name, () => {
              const result = validate(testCase.ptml);
              expect(result.isValid).toBe(true);
            });
          });
        });
      }

      if (invalidCases.length > 0) {
        describe('Invalid cases', () => {
          invalidCases.forEach((testCase) => {
            it(testCase.name, () => {
              const result = validate(testCase.ptml);
              expect(result.isValid).toBe(false);
              if (testCase.expectedError && !result.isValid) {
                const normalizedExpected = normalizeLineNumbers(testCase.expectedError);
                const normalizedActual = normalizeLineNumbers(result.errorMessage);
                expect(normalizedActual).toBe(normalizedExpected);
              }
            });
          });
        });
      }
    });
  });
});
