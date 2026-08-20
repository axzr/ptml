import type { NodeSchema } from '../../schemas/types';
import { validateBreakpoint } from './breakpoint.validation';
import { breakpointNodeToReact } from './breakpoint.render';

export const breakpointSchema: NodeSchema = {
  name: 'breakpoint',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Conditionally renders its children when the viewport matches the breakpoint condition. Data is a breakpoint label (e.g. small), "label or more", or "label or less"; the label must be one declared in a breakpoints declaration. A breakpoint block is an override layered on top of what surrounds it, never a replacement for it: breakpoints are resolved against the render context viewportWidth rather than by CSS media queries, so where no viewport is known -- server rendering, or a host that supplies none -- no breakpoint block renders and no breakpoint style applies. Whatever sits outside breakpoint blocks is therefore the fallback layout, and must stand on its own. Which end of the range that fallback describes is your choice: put mobile styles in the base and widen with "or more" for mobile-first, or the reverse for desktop-first.',
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
          'Breakpoint label, "label or more", or "label or less". Must match a label defined in a breakpoints declaration.',
        required: true,
        format: {
          type: 'string',
          validator: 'breakpoint-reference',
        },
      },
    },
    // No max: a breakpoint reference is a single multi-part value ("small or
    // less"), not a list of parts. Capping the part count here rejected the
    // documented "or more"/"or less" forms before the breakpoint-reference
    // validator ever saw them. Same convention as if/each/where.
    min: 1,
  },
  example: '> breakpoint: small',
  functions: {
    validate: validateBreakpoint,
    getContext: () => ({ parentNode: 'box' }),
    render: breakpointNodeToReact,
  },
};
