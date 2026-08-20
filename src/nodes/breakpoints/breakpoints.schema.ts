import type { NodeSchema } from '../../schemas/types';
import { validateBreakpoints } from './breakpoints.validation';

export const breakpointsSchema: NodeSchema = {
  name: 'breakpoints',
  category: 'declaration',
  description:
    'Root node that defines named breakpoint labels and their pixel widths. Children are label: width pairs in ascending order; the last child has no width (and above tier). Each label names the range running up to its own width, so with small: 768, medium: 1024, large: the label small covers widths below 768 and large covers 1024 and up. Used by breakpoint blocks and define for responsive layout and conditional styles. A file uses its own declaration if it has one, otherwise it inherits the declaration of the first file it imports that has one.',
  properties: {
    allowAny: true,
    description: 'Breakpoint label and optional width (pixels, no unit). Last child has no width.',
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: 'breakpoints:\n- small: 768\n- medium: 1024\n- large:',
  functions: {
    validate: validateBreakpoints,
    getContext: () => ({ parentNode: undefined }),
  },
};
