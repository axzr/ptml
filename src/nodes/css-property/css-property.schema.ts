import type { NodeSchema } from '../../schemas/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const cssPropertySchema: NodeSchema = {
  name: 'css-property',
  category: 'property',
  childType: true,
  description:
    'A dynamic child type where the child type name is the CSS property name (e.g., "color", "font-size") and child data is the property value. Used in styles nodes for inline CSS properties.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  data: {
    allowed: true,
  },
  example: '- color: red',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({ parentNode: undefined }),
  },
};
