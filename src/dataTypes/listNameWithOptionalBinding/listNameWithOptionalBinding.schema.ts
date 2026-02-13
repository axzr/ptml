import type { DataTypeSchema } from '../types';
import { validateListNameWithOptionalBinding } from './listNameWithOptionalBinding.validation';

export const listNameWithOptionalBindingSchema: DataTypeSchema = {
  name: 'list-name-with-optional-binding',
  description: 'List name with optional binding',
  example: 'fruits as $fruit',
  functions: {
    validate: validateListNameWithOptionalBinding,
  },
};
