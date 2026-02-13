import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { tableNodeToReact } from './table.render';

export const tableSchema: NodeSchema = {
  name: 'table',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A table container that renders as HTML table. Groups row children by role (header/body/footer) into thead, tbody, tfoot. Only row nodes may be direct block children.',
  blocks: {
    list: [{ name: 'row' }],
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '> table:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: tableNodeToReact,
  },
};
