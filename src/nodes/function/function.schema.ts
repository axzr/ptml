import type { NodeSchema } from '../../schemas/types';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import { validateFunction } from './function.validation';

export const functionSchema: NodeSchema = {
  name: 'function',
  category: 'declaration',
  description:
    'Defines a reusable function with optional parameters. Functions can contain actions like set, list operations, and calls to other functions.',
  blocks: {
    list: [{ name: 'range' }, { name: 'each' }],
  },
  properties: {
    list: [],
  },
  actions: {
    allowAny: true,
  },
  providesFunctionalContext: true,
  data: {
    required: true,
    noRepeats: true,
    format: {
      first: {
        name: 'function name',
        description:
          'The name of the function. Cannot start with $. Function names must be unique within the document.',
        required: true,
        format: {
          type: 'string',
          validator: 'function-name',
        },
      },
      rest: {
        name: 'parameter',
        description:
          'Optional parameter names. Parameters cannot start with $ and must be unique within the function. Parameters are available as variables within the function body.',
        required: false,
        format: {
          type: 'string',
          validator: 'parameter-name',
        },
      },
    },
    min: 1,
  },
  example: 'function: increment',
  functions: {
    validate: validateFunction,
    getContext: () => ({ state: { value: '0', items: '[1, 2, 3]' }, parentNode: undefined }),
    wrapAsParent: (nodePTML: string) => [`function: processItems`, indentChildLines(nodePTML, 2)],
    wrapAsRoot: (nodePTML: string) => [`function: processItems`, nodePTML],
  },
};
