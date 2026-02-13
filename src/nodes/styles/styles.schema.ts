import type { NodeSchema } from '../../schemas/types';
import { validateStyles } from './styles.validation';

export const stylesSchema: NodeSchema = {
  name: 'styles',
  category: 'property',
  allowedAsContainerChild: true,
  description:
    'Property node that applies CSS styles to elements. Can optionally reference a named style defined with define: or define inline styles. Styles can contain CSS properties (e.g., color, font-size) and conditional styles using if/else nodes.',
  properties: {
    allowAny: true,
  },
  blocks: {
    list: [],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    required: false,
    format: {
      first: {
        name: 'style-name',
        description:
          'Optional reference to a named style defined with define:. When present, must be a valid identifier that matches a defined style name.',
        required: false,
        format: {
          type: 'string',
          validator: 'style-name',
        },
      },
    },
    min: 0,
    max: 1,
  },
  example: '- styles:',
  functions: {
    validate: validateStyles,
    getContext: () => ({ state: { isActive: 'true', x: '0' }, parentNode: 'box' }),
  },
};
