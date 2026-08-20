import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { textareaNodeToReact } from './textarea.render';

export const textareaSchema: NodeSchema = {
  name: 'textarea',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A multi-line text input field element. Textarea fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.description). A textarea needs a binding so that what is typed goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable (e.g. - value: $notes). Placeholder and styles are optional. Placeholder can be a literal string or a state reference (e.g. $hint).',
  properties: {
    list: [{ name: 'id' }, { name: 'value' }, { name: 'placeholder' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- textarea:\n  - id: notes',
  functions: {
    validate: validateFormField,
    getContext: () => ({ parentNode: 'form' }),
    render: textareaNodeToReact,
  },
};
