import type { DataTypeSchema } from '../types';
import { validateIfCondition } from './ifCondition.validation';

export const ifConditionSchema: DataTypeSchema = {
  name: 'if-condition',
  description: 'If condition',
  example: '$isActive',
  isMultiPart: true,
  functions: {
    validate: validateIfCondition,
  },
};
