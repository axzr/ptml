import type { DataTypeSchema } from '../types';
import { validateStyleName } from './styleName.validation';

export const styleNameSchema: DataTypeSchema = {
  name: 'style-name',
  description: 'Style name without spaces',
  example: 'primary',
  functions: {
    validate: validateStyleName,
  },
};
