import { getExampleContextForListOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { processAddValueOperation, executeAddValueOperation } from './addValue.execute';
import type { NodeSchema } from '../../schemas/types';

export const addValueSchema: NodeSchema = {
  name: 'addValue',
  category: 'action',
  description: 'Adds a simple value to a list. The value can be an expression with variables, pipes, etc.',
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
        description: 'The name of the list to add the item to',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'item-value',
        description: 'Required item value to add to the list (expression with variables, pipes, etc.)',
        required: true,
        format: {
          type: 'expression',
          validator: 'value-expression',
        },
      },
    },
    min: 2,
  },
  example: '- addValue: items value',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListOperations,
    listOperationHandler: processAddValueOperation,
    execute: executeAddValueOperation,
  },
};
