import type { NodeSchema } from '../../schemas/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const stateArraySchema: NodeSchema = {
  name: 'state-array',
  category: 'property',
  childType: true,
  description:
    'A dynamic child type where the child type name is the array variable name (any valid string) and the child has no data but contains children (property nodes) that define the array items. Used in state nodes for array variables. Array items use the "- value" syntax (property nodes without type prefix).',
  blocks: {
    list: [],
  },
  properties: {
    list: [{ name: 'value' }],
  },
  data: {
    allowed: false,
  },
  example: '- items:',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({ parentNode: undefined }),
  },
};
