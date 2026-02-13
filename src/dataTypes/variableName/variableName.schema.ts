import type { DataTypeSchema } from '../types';
import { validateVariableName } from './variableName.validation';

export const variableNameSchema: DataTypeSchema = {
  name: 'variable-name',
  description: 'Variable name with leading dollar',
  example: '$x',
  functions: {
    validate: validateVariableName,
  },
};
