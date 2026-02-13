import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';

export const recordListSchema: NodeSchema = {
  name: 'recordList',
  category: 'declaration',
  initializesLists: true,
  listItemType: 'record',
  description:
    'Defines a list of record items. Records contain key-value pairs as their children. Record items are written as "- record:" with key-value children.',
  blocks: {
    list: [],
  },
  properties: {
    list: [{ name: 'record' }],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description:
          'Required list name. Must be a single word. Inline items are not supported - use child syntax with "- record:" instead.',
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
  example: 'recordList: expenses',
  functions: {
    validate: validateDeclarationDefault,
    getContext: () => ({ parentNode: undefined }),
    wrapAsParent: (nodePTML: string) => [`recordList: expenses`, `  ${nodePTML}`],
    wrapAsRoot: (nodePTML: string) => [`recordList: expenses`, nodePTML],
  },
};
