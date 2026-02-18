import { validateActionDefault } from '../../categories/action/action.validation';
import { executeWindowOperation } from './window.execute';
import type { NodeSchema } from '../../schemas/types';

export const windowSchema: NodeSchema = {
  name: 'window',
  category: 'action',
  description:
    'Performs a browser window operation. Currently supports scrollTop to scroll the page to the top. Extensible for future operations.',
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
        name: 'operation',
        description: 'The window operation to perform. Supported: scrollTop.',
        required: true,
        format: {
          type: 'string',
          validator: 'window-operation',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: '! window: scrollTop',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: () => ({ state: {}, parentNode: 'click' }),
    execute: executeWindowOperation,
  },
};
