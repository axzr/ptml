import type { DataTypeSchema } from '../types';
import { validateTemplateReference } from './templateReference.validation';

export const templateReferenceSchema: DataTypeSchema = {
  name: 'template-reference',
  description: 'Template reference',
  example: 'home',
  isMultiPart: true,
  functions: {
    validate: validateTemplateReference,
  },
};
