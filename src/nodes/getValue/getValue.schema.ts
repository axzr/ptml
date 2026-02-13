import { getExampleContextForListGetSetOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import type { NodeSchema } from '../../schemas/types';

export const getValueSchema: NodeSchema = {
  name: 'getValue',
  category: 'action',
  updatesLoopVariables: true,
  description:
    'Gets a value from a list at a specific index and makes it available as a loop variable. The index can be a number or a variable reference. The retrieved value is assigned to the specified variable name for use in subsequent nodes.',
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
        description: 'The name of the list to get the value from',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'index',
        description: 'The index (number or variable reference starting with $) of the value to retrieve',
        required: true,
        format: {
          type: 'string',
          validator: 'index-expression',
        },
      },
      rest: {
        name: 'variable-binding',
        description: 'Variable binding in format "as $variableName" to assign the retrieved value',
        required: true,
        format: {
          type: 'string',
          validator: 'variable-binding',
        },
      },
    },
    min: 3,
  },
  example: '- getValue: items $index as $item',
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListGetSetOperations,
  },
};
