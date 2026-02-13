import type { DataTypeSchema } from '../types';
import { validateBoxRole } from './boxRole.validation';

export const boxRoleSchema: DataTypeSchema = {
  name: 'box-role',
  description: 'Box semantic element: main, header, footer, article, section, nav, or aside',
  example: 'main',
  functions: {
    validate: validateBoxRole,
  },
};
