import { validateActionDefault } from '../../categories/action/action.validation';
import { processSetOperation, executeSetOperation } from './set.execute';
import type { NodeSchema } from '../../schemas/types';

export const setSchema: NodeSchema = {
  name: 'set',
  category: 'action',
  description:
    'Sets a state variable to a value. The variable name must start with $. The value can be a literal or an expression using pipes.',
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
        name: 'variable-name',
        description: 'The state variable to set (must start with $)',
        required: true,
        format: {
          type: 'string',
          validator: 'variable-name',
        },
      },
      rest: {
        name: 'value-expression',
        description:
          'Optional value expression. Can be a literal value or an expression using pipes. Variables in the expression must be defined in state, available in the current loop context, be list names, or be function parameters.',
        required: false,
        format: {
          type: 'string',
          validator: 'pipe-expression',
        },
      },
    },
    min: 1,
  },
  example: '- set: $x 0',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: () => ({ state: { x: '0', name: 'Dave' }, parentNode: 'click' }),
    stateOperationHandler: processSetOperation,
    execute: executeSetOperation,
  },
};
