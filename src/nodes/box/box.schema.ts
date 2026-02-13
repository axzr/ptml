import type { NodeSchema } from '../../schemas/types';
import { boxNodeToReact } from './box.render';
import { validateBox } from './box.validation';

export const boxSchema: NodeSchema = {
  name: 'box',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A container element that can hold other nodes. Optional role (main, header, footer, article, section, nav, aside) renders as that HTML element instead of div. Boxes can be nested and can contain text, buttons, other boxes, and control structures.',
  blocks: {
    isContainerParent: true,
  },
  properties: {
    list: [{ name: 'styles' }, { name: 'role' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '- box:\n  - role: main',
  functions: {
    validate: validateBox,
    getContext: () => ({ parentNode: undefined }),
    render: boxNodeToReact,
  },
};
