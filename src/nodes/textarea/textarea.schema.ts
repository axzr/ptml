import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { textareaNodeToReact } from './textarea.render';

export const textareaSchema: NodeSchema = {
  name: 'textarea',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A multi-line text input field element. Textarea fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.description). Textareas require an id (as a key-value child), and can have optional styles.',
  properties: {
    list: [{ name: 'id', required: true }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- textarea:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
    render: textareaNodeToReact,
  },
};
