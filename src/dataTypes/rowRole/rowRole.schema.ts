import type { DataTypeSchema } from '../types';
import { validateRowRole } from './rowRole.validation';

export const rowRoleSchema: DataTypeSchema = {
  name: 'row-role',
  description: 'Table row role: header, body, or footer',
  example: 'body',
  functions: {
    validate: validateRowRole,
  },
};
