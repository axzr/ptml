import type { NodeSchema } from '../../schemas/types';
import { validateBreakpoint } from './breakpoint.validation';
import { breakpointNodeToReact } from './breakpoint.render';

export const breakpointSchema: NodeSchema = {
  name: 'breakpoint',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Conditionally renders its children when the viewport matches the breakpoint condition. Data is a breakpoint label (e.g. small) or "label or more" or "label or less". Requires a breakpoints declaration and viewportWidth in render context.',
  blocks: {
    isContainerParent: true,
  },
  properties: {
    allowAny: true,
    description: 'When under define: CSS properties. When in block context: N/A (block children only).',
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'breakpoint-reference',
        description:
          'Breakpoint label or "label or more" or "label or less". Must match a label defined in a breakpoints declaration.',
        required: true,
        format: {
          type: 'string',
          validator: 'breakpoint-reference',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: '> breakpoint: small',
  functions: {
    validate: validateBreakpoint,
    getContext: () => ({ parentNode: 'box' }),
    render: breakpointNodeToReact,
  },
};
