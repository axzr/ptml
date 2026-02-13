import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { textNodeToReact } from './text.render';

export const textSchema: NodeSchema = {
  name: 'text',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Displays text content. Text can contain interpolated expressions using $variable syntax and pipe expressions. Text nodes can have optional inline styles.',
  blocks: {
    list: [],
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  data: {
    required: false,
  },
  example: '- text: Hello',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'box' }),
    render: textNodeToReact,
  },
};
