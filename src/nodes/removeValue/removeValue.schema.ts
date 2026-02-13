import { getExampleContextForListOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { processRemoveValueOperation, executeRemoveValueOperation } from './removeValue.execute';
import type { NodeSchema } from '../../schemas/types';

export const removeValueSchema: NodeSchema = {
  name: 'removeValue',
  category: 'action',
  description: 'Removes a value from a list by matching the value directly.',
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
        description: 'The name of the list to remove the value from',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'item-value',
        description: 'The value expression to remove from the list',
        required: true,
        format: {
          type: 'expression',
          validator: 'value-expression',
        },
      },
    },
    min: 2,
    max: 2,
  },
  example: '- removeValue: items value',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListOperations,
    listOperationHandler: processRemoveValueOperation,
    execute: executeRemoveValueOperation,
  },
};
