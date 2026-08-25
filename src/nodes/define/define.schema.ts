import type { NodeSchema } from '../../schemas/types';
import { validateDefine } from './define.validation';

export const defineSchema: NodeSchema = {
  name: 'define',
  category: 'declaration',
  description:
    'Root node for defining named CSS styles that can be referenced elsewhere. Style definitions can contain CSS properties (e.g., color, font-size) and conditional styles using if/else nodes. The style name is required and must be a valid identifier. A when child adds styles that apply only in an interaction state -- hover, focus, active, disabled or placeholder -- which a named style can express and an inline style cannot, since no pseudo-state can be written as a style attribute. A define carrying when blocks is given a generated class and the document emits a stylesheet for it.',
  properties: {
    allowAny: true,
    description: 'Any CSS property name',
  },
  blocks: {
    list: [{ name: 'breakpoint' }, { name: 'when' }],
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
    // A define requires a style name, so generated cases nesting inside one
    // need a named define rather than the bare node name.
    wrapAsRoot: (nodePTML: string) => ['define: card', nodePTML],
  },
};
