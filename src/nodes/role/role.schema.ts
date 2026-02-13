import type { NodeSchema } from '../../schemas/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const roleSchema: NodeSchema = {
  name: 'role',
  category: 'property',
  description: 'Property that specifies a row section: header, body, or footer. Used as child of row. Default is body.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  conditionals: {
    allowed: false,
  },
  data: {
    allowed: true,
    required: false,
    format: {
      first: {
        name: 'role',
        description: 'Optional header, body, or footer. Default is body.',
        required: false,
        format: {
          type: 'string',
          validator: 'row-role',
        },
      },
    },
  },
  example: '- role: header',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({ parentNode: undefined }),
  },
};
