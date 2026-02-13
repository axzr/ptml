import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { linkNodeToReact } from './link.render';

export const linkSchema: NodeSchema = {
  name: 'link',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A hyperlink element for external URLs or in-app navigation. Requires href (as a key-value child). Can have optional text, target (e.g. _blank), styles, and a click handler for in-app navigation (e.g. set: page shop with show: $page).',
  properties: {
    list: [
      { name: 'href', required: true },
      { name: 'text' },
      { name: 'target' },
      { name: 'styles' },
      { name: 'click' },
    ],
  },
  blocks: {
    isContainerParent: true,
  },
  data: {
    allowed: false,
  },
  example: '- link:\n  - href: https://example.com\n  - text: Example',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'box' }),
    render: linkNodeToReact,
  },
};
