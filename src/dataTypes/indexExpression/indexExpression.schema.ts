import type { DataTypeSchema } from '../types';
import { validateIndexExpressionValue } from './indexExpression.validation';

export const indexExpressionSchema: DataTypeSchema = {
  name: 'index-expression',
  description: 'Index expression',
  example: '0',
  functions: {
    validate: validateIndexExpressionValue,
  },
};
