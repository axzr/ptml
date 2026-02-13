import type { NodeSchema } from '../../schemas/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const keyValueSchema: NodeSchema = {
  name: 'key-value',
  category: 'property',
  childType: true,
  description:
    'A dynamic child type where the child type name is the key (any valid string) and child data is the value. Used in state nodes for scalar variables and record nodes for key-value pairs.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  data: {
    allowed: true,
  },
  example: '- name: value',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({ parentNode: undefined }),
  },
};
