import type { DataTypeSchema } from '../types';
import { validateVariableBindingValue } from './variableBinding.validation';

export const variableBindingSchema: DataTypeSchema = {
  name: 'variable-binding',
  description: 'Variable binding: as $variable',
  example: 'as $name',
  isMultiPart: true,
  functions: {
    validate: validateVariableBindingValue,
  },
};
