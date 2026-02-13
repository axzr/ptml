import type { DataTypeSchema } from '../types';
import { validateValueExpressionValue } from './valueExpression.validation';

export const valueExpressionSchema: DataTypeSchema = {
  name: 'value-expression',
  description: 'Value expression',
  example: '0',
  isMultiPart: true,
  functions: {
    validate: validateValueExpressionValue,
  },
};
