import type { NodeSchema } from '../../schemas/types';
import { validateElseBlock } from './elseBlock.validation';

export const elseSchema: NodeSchema = {
  name: 'else',
  category: 'conditional',
  allowedAsContainerChild: true,
  description:
    'Provides alternative content when the preceding sibling if node condition is false. Must be paired with a sibling if node.',
  requiresSibling: 'if',
  blocks: {
    isContainerParent: true,
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '- else:',
  functions: {
    validate: validateElseBlock,
    getContext: () => ({ state: { isActive: 'true' }, parentNode: 'box' }),
  },
};
