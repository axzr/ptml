import { getExampleContextForListOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { executeUpdateValueOperation } from './updateValue.execute';
import type { NodeSchema } from '../../schemas/types';

export const updateValueSchema: NodeSchema = {
  name: 'updateValue',
  category: 'action',
  description:
    'Updates a value in a list at a specific index. The index can be a number or a variable reference. The value can be an expression with variables, pipes, etc.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description: 'The name of the list to update the value in',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'index',
        description: 'The index (number or variable reference starting with $) where to update the value',
        required: true,
        format: {
          type: 'string',
          validator: 'index-expression',
        },
      },
      rest: {
        name: 'value-expression',
        description: 'The value expression to set at the specified index (can include variables, pipes, etc.)',
        required: true,
        format: {
          type: 'expression',
          validator: 'value-expression',
        },
      },
    },
    min: 3,
  },
  example: '- updateValue: items $index newValue',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListOperations,
    execute: executeUpdateValueOperation,
  },
};
