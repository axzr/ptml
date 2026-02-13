import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';

export const initSchema: NodeSchema = {
  name: 'init',
  category: 'declaration',
  description: 'May only contain call nodes; runs those function calls when PTML first renders.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  actions: {
    allowedTypes: ['call'],
  },
  providesFunctionalContext: true,
  data: {
    allowed: false,
  },
  example: 'init:',
  functions: {
    validate: validateDeclarationDefault,
    getContext: () => ({ state: { myFunction: 'increment' }, parentNode: undefined }),
  },
};
