import type { NodeSchema } from '../../schemas/types';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const clickSchema: NodeSchema = {
  name: 'click',
  category: 'property',
  description:
    'Defines click handler actions for buttons and other clickable elements. Contains one or more actions to execute when clicked.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  actions: {
    allowAny: true,
  },
  providesFunctionalContext: true,
  data: {
    allowed: false,
  },
  example: '- click:',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({ state: { name: 'Dave' }, parentNode: 'button' }),
    wrapAsParent: (nodePTML: string) => `ptml:\n> button:\n  - click:\n${indentChildLines(nodePTML, 4)}`,
  },
};
