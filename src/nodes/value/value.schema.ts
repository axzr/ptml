import type { NodeSchema } from '../../schemas/types';
import { validateValue } from './value.validation';

export const valueSchema: NodeSchema = {
  name: 'value',
  category: 'property',
  description: 'A value list item. Simple string value. Written as "- value" with the string as data.',
  properties: {
    list: [],
  },
  blocks: {
    list: [],
  },
  data: {
    required: true,
  },
  example: '- value: item one',
  childType: true,
  functions: {
    validate: validateValue,
    getContext: () => ({ parentNode: undefined }),
  },
};
