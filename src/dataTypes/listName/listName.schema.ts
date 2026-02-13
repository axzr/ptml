import type { DataTypeSchema } from '../types';
import { validateListName } from './listName.validation';

export const listNameSchema: DataTypeSchema = {
  name: 'list-name',
  description: 'List name without spaces',
  example: 'items',
  functions: {
    validate: validateListName,
  },
};
