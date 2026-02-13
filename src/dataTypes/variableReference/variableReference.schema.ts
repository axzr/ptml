import type { DataTypeSchema } from '../types';
import { validateVariableReference } from './variableReference.validation';

export const variableReferenceSchema: DataTypeSchema = {
  name: 'variable-reference',
  description: 'Variable reference with leading dollar',
  example: '$x',
  getExample: (partName: string) => (partName.includes('function') ? '$myFunction' : '$x'),
  functions: {
    validate: validateVariableReference,
  },
};
