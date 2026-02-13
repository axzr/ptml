import type { NodeSchema } from '../../schemas/types';
import { validateDefine } from './define.validation';

export const defineSchema: NodeSchema = {
  name: 'define',
  category: 'declaration',
  description:
    'Root node for defining named CSS styles that can be referenced elsewhere. Style definitions can contain CSS properties (e.g., color, font-size) and conditional styles using if/else nodes. The style name is required and must be a valid identifier.',
  properties: {
    allowAny: true,
    description: 'Any CSS property name',
  },
  blocks: {
    list: [{ name: 'breakpoint' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'style-name',
        description: 'Style name (required). Must be a valid identifier that can be referenced from styles properties.',
        required: true,
        format: {
          type: 'string',
          validator: 'style-name',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: 'define: myStyle',
  functions: {
    validate: validateDefine,
    getContext: () => ({ parentNode: undefined, state: { isActive: 'true' } }),
  },
};
