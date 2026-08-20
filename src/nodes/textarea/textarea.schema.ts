import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { textareaNodeToReact } from './textarea.render';

export const textareaSchema: NodeSchema = {
  name: 'textarea',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A multi-line text input field element. Textarea fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.description). Textareas require an id (as a key-value child), and can have optional placeholder text and styles. Placeholder can be a literal string or a state reference (e.g. $hint).',
  properties: {
    list: [{ name: 'id', required: true }, { name: 'value' }, { name: 'placeholder' }, { name: 'styles' }],
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
