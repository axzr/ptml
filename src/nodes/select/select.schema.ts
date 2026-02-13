import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';

export const selectSchema: NodeSchema = {
  name: 'select',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A dropdown select element for forms. Select fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.country). Selects require an id (as a key-value child) and one or more option children, and can have optional value (for default/state binding) and styles.',
  properties: {
    list: [{ name: 'id', required: true }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [{ name: 'option' }],
  },
  data: {
    allowed: false,
  },
  example: '- select:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
  },
};
