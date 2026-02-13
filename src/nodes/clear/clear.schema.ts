import { validateActionDefault } from '../../categories/action/action.validation';
import { executeClearOperation } from './clear.execute';
import type { NodeSchema } from '../../schemas/types';

export const clearSchema: NodeSchema = {
  name: 'clear',
  category: 'action',
  description: 'Clears a state variable or form field by setting it to an empty string',
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
        description: 'The name of the state variable or form field to clear (with or without $ prefix)',
        required: true,
        format: {
          type: 'string',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: '- clear: $input',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: () => ({ state: { input: 'hello world' }, parentNode: 'click' }),
    execute: executeClearOperation,
  },
};
