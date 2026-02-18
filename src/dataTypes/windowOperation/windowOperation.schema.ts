import type { DataTypeSchema } from '../types';
import { validateWindowOperation } from './windowOperation.validation';

export const windowOperationSchema: DataTypeSchema = {
  name: 'window-operation',
  description: 'A valid window operation: scrollTop',
  example: 'scrollTop',
  functions: {
    validate: validateWindowOperation,
  },
};
