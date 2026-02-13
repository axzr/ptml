import type { DataTypeSchema } from '../types';
import { validateListNameReference } from './listNameReference.validation';

export const listNameReferenceSchema: DataTypeSchema = {
  name: 'list-name-reference',
  description: 'List name reference that must exist',
  example: 'items',
  functions: {
    validate: validateListNameReference,
  },
};
