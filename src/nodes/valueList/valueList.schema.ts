import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';

export const valueListSchema: NodeSchema = {
  name: 'valueList',
  category: 'declaration',
  initializesLists: true,
  listItemType: 'value',
  description: 'Defines a list of simple string values. Value items are written as "- value" without a type prefix.',
  properties: {
    list: [{ name: 'value' }],
  },
  blocks: {
    list: [],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description:
          'Required list name. Must be a single word. Inline items are not supported - use child syntax with "- value" (no type prefix) instead.',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: 'valueList: items',
  functions: {
    validate: validateDeclarationDefault,
    getContext: () => ({ parentNode: undefined }),
    wrapAsParent: (nodePTML: string) => [`valueList: items`, `  ${nodePTML}`],
    wrapAsRoot: (nodePTML: string) => [`valueList: items`, nodePTML],
  },
};
