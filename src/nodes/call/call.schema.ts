import { validateActionDefault } from '../../categories/action/action.validation';
import { executeFunctionCall } from '../../evaluation/functionOperations';
import type { NodeSchema } from '../../schemas/types';

export const callSchema: NodeSchema = {
  name: 'call',
  category: 'action',
  description:
    'Calls a function with optional arguments. The function name can be a literal function name or a variable (starting with $) that resolves to a function name.',
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
        name: 'function-name',
        description:
          'The name of the function to call. Can be a literal function name or a variable (starting with $) that resolves to a function name. Variables can reference state variables, loop variables, list names, or function parameters.',
        required: true,
        format: {
          type: 'string',
          validator: 'resolves-to-function-name',
        },
      },
      rest: {
        name: 'argument',
        description:
          'Optional arguments to pass to the function. Each argument is an expression that can include variables, pipes, and other operations.',
        required: false,
        format: {
          type: 'expression',
          validator: 'value-expression',
        },
      },
    },
    min: 1,
  },
  example: '- call: $myFunction',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: () => ({ state: { myFunction: 'increment' }, parentNode: 'click' }),
    execute: executeFunctionCall,
  },
};
