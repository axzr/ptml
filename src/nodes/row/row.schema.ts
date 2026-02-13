import type { NodeSchema } from '../../schemas/types';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import { rowNodeToReact } from './row.render';
import { validateRow } from './row.validation';

export const rowSchema: NodeSchema = {
  name: 'row',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: false,
  description:
    'A table row that renders as HTML tr. Optional property - role: header | body | footer (default body). Only cell nodes may be direct block children. Only valid as a direct block child of a table node.',
  blocks: {
    list: [{ name: 'cell' }],
  },
  properties: {
    list: [{ name: 'role' }, { name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '> row:',
  functions: {
    validate: validateRow,
    getContext: () => ({ parentNode: 'table' }),
    render: rowNodeToReact,
    wrapAsParent: (nodePTML: string) => `ptml:\n> table:\n  > row:\n${indentChildLines(nodePTML, 4)}`,
  },
};
