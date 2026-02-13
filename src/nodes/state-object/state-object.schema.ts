import type { NodeSchema } from '../../schemas/types';
import { validateStateObject } from './state-object.validation';

export const stateObjectSchema: NodeSchema = {
  name: 'state-object',
  category: 'property',
  childType: true,
  description:
    'A dynamic child type where the child type name is the object variable name (any valid string) and the child has no data but contains children (key-value or state-object nodes) that define the object properties. Used in state nodes for nested object variables.',
  blocks: {
    list: [],
  },
  properties: {
    allowAny: true,
    list: [{ name: 'key-value' }, { name: 'state-object' }],
  },
  data: {
    allowed: false,
  },
  example: '- objectName:',
  functions: {
    validate: validateStateObject,
    getContext: () => ({ parentNode: undefined }),
  },
};
