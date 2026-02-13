import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { listItemNodeToReact } from './listItem.render';

export const listItemSchema: NodeSchema = {
  name: 'listItem',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A list item that renders as an HTML li element. Content comes from children (e.g. text, box). Typically used inside a list node.',
  blocks: {
    isContainerParent: true,
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '> listItem:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: listItemNodeToReact,
  },
};
