import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { listNodeToReact } from './list.render';

export const listSchema: NodeSchema = {
  name: 'list',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A list container that renders as an HTML ul (unordered) or ol (ordered) based on the optional type property. Use - type: ordered or - type: decimal for ordered lists; - type: lower-alpha, upper-alpha, lower-roman, upper-roman for ordered lists with that list style. Omit type for unordered (bullet) list. Only listItem nodes may be direct block children.',
  blocks: {
    list: [{ name: 'listItem' }],
  },
  properties: {
    list: [{ name: 'type' }, { name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '> list:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: listNodeToReact,
  },
};
