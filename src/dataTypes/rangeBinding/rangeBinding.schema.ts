import type { DataTypeSchema } from '../types';
import { validateRangeBinding } from './rangeBinding.validation';

export const rangeBindingSchema: DataTypeSchema = {
  name: 'range-binding',
  description: 'Range binding: list as $variable',
  example: '$items as $index',
  isMultiPart: true,
  functions: {
    validate: validateRangeBinding,
  },
};
