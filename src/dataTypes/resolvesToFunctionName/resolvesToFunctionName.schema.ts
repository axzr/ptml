import type { DataTypeSchema } from '../types';
import { validateResolvesToFunctionName } from './resolvesToFunctionName.validation';

export const resolvesToFunctionNameSchema: DataTypeSchema = {
  name: 'resolves-to-function-name',
  description: 'Resolves to function name',
  example: '$myFunction',
  getExample: (partName: string) => (partName.includes('function') ? '$myFunction' : '$x'),
  functions: {
    validate: validateResolvesToFunctionName,
  },
};
