import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { cellNodeToReact } from './cell.render';

export const cellSchema: NodeSchema = {
  name: 'cell',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: false,
  description:
    'A table cell that renders as th or td based on the row section. Content comes from children (e.g. text, box). Only valid as a direct block child of a row node.',
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
  example: '> cell:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'row' }),
    render: cellNodeToReact,
  },
};
