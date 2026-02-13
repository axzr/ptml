import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { checkboxNodeToReact } from './checkbox.render';

export const checkboxSchema: NodeSchema = {
  name: 'checkbox',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A checkbox input field for forms. Checkboxes can be accessed via form.fieldName syntax (e.g., form.agree). Checkboxes require an id (as a key-value child) and can have optional value (for state binding) and styles.',
  properties: {
    list: [{ name: 'id', required: true }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- checkbox:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
    render: checkboxNodeToReact,
  },
};
