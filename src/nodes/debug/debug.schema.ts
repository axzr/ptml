import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { debugNodeToReact } from './debug.render';

export const debugSchema: NodeSchema = {
  name: 'debug',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Displays debugging information showing the current state, lists, and loop context in a readable format. Useful for development and troubleshooting.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- debug:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: debugNodeToReact,
  },
};
