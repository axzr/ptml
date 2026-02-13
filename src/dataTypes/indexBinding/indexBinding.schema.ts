import type { DataTypeSchema } from '../types';
import { validateIndexBinding } from './indexBinding.validation';

export const indexBindingSchema: DataTypeSchema = {
  name: 'index-binding',
  description: 'Index binding: index as $variable',
  example: 'index as $index',
  functions: {
    validate: validateIndexBinding,
  },
};
