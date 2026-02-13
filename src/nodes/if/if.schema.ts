import type { NodeSchema } from '../../schemas/types';
import { validateIfBlock } from './ifBlock.validation';
import { ifNodeToReact } from './if.render';

export const ifSchema: NodeSchema = {
  name: 'if',
  category: 'conditional',
  allowedAsContainerChild: true,
  description:
    'Conditionally renders its children based on a condition. The condition can be a simple variable check or a comparison expression.',
  blocks: {
    isContainerParent: true,
  },
  conditionals: {
    allowed: true,
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'condition',
        description:
          'Required condition expression. Can be a simple variable (e.g., $isActive) or a comparison expression (e.g., $variable is value). Variables must start with $.',
        required: true,
        format: {
          type: 'string',
          validator: 'if-condition',
        },
      },
    },
    min: 1,
  },
  example: '- if: $isActive',
  functions: {
    validate: validateIfBlock,
    getContext: () => ({ state: { isActive: 'true' }, parentNode: 'box' }),
    render: ifNodeToReact,
  },
};
