import type { NodeSchema } from '../../schemas/types';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { buttonNodeToReact } from './button.render';

export const buttonSchema: NodeSchema = {
  name: 'button',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description: 'A clickable button element that can contain text, styles, click handlers, and conditional disabling.',
  blocks: {
    list: [{ name: 'text' }],
  },
  properties: {
    list: [{ name: 'styles' }, { name: 'click' }, { name: 'disabled' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '- button:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: buttonNodeToReact,
    wrapAsParent: (nodePTML: string) => `ptml:\n> button:\n${indentChildLines(nodePTML, 2)}`,
  },
};
