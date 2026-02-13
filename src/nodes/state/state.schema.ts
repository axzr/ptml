import type { NodeSchema } from '../../schemas/types';
import { validateState } from './state.validation';

export const stateSchema: NodeSchema = {
  name: 'state',
  category: 'declaration',
  initializesState: true,
  description:
    'A state node that declares state variables. State nodes have no data themselves, but contain children where each child type is a variable name (key). Children can be scalar key-value pairs (with data, no children), nested objects (with children, no data), or arrays (with children using -: prefix, no data). Variable names must be unique within a state node.',
  checkVariableConflicts: true,
  properties: {
    allowAny: true,
    list: [{ name: 'key-value' }, { name: 'state-object' }, { name: 'state-array' }],
  },
  data: {
    allowed: false,
  },
  example: 'state:',
  functions: {
    validate: validateState,
    getContext: () => ({ parentNode: undefined }),
  },
};
