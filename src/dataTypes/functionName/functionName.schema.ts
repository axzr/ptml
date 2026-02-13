import type { DataTypeSchema } from '../types';
import { validateFunctionName } from './functionName.validation';

export const functionNameSchema: DataTypeSchema = {
  name: 'function-name',
  description: 'Function name without leading dollar',
  example: 'increment',
  functions: {
    validate: validateFunctionName,
  },
};
