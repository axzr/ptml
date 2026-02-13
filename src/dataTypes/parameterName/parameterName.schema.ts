import type { DataTypeSchema } from '../types';
import { validateParameterName } from './parameterName.validation';

export const parameterNameSchema: DataTypeSchema = {
  name: 'parameter-name',
  description: 'Parameter name without leading dollar',
  example: 'param',
  functions: {
    validate: validateParameterName,
  },
};
