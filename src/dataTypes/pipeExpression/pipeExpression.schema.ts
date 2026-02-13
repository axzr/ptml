import type { DataTypeSchema } from '../types';
import { validatePipeExpressionValue } from './pipeExpression.validation';

export const pipeExpressionSchema: DataTypeSchema = {
  name: 'pipe-expression',
  description: 'Pipe expression value',
  example: '0',
  isMultiPart: true,
  functions: {
    validate: validatePipeExpressionValue,
  },
};
