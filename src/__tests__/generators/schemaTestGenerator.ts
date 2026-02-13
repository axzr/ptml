import type { NodeSchema } from '../../schemas/types';
import type { GeneratedTestCase } from '../../schemaRegistry/testCaseTypes';
import { generateValidCases } from './validCaseGenerator';
import { generateInvalidCases } from './invalidCaseGenerator';

export { getDataForNode } from './testCaseHelpers';
export { generateValidCaseForRegularNode } from './validCaseGenerator';

export const generateTestCases = (schema: NodeSchema): GeneratedTestCase[] => {
  const validCases = generateValidCases(schema);
  const invalidCases = generateInvalidCases(schema);
  return [...validCases, ...invalidCases];
};
