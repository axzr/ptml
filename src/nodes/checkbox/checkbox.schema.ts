import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { checkboxNodeToReact } from './checkbox.render';

export const checkboxSchema: NodeSchema = {
  name: 'checkbox',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A checkbox input field for forms. Checkboxes can be accessed via form.fieldName syntax (e.g., form.agree). A checkbox needs a binding so that its checked state goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable (e.g. - value: $agree). Styles are optional.',
  properties: {
    list: [{ name: 'id' }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- checkbox:\n  - id: accept',
  functions: {
    validate: validateFormField,
    getContext: () => ({ parentNode: 'form' }),
    render: checkboxNodeToReact,
  },
};
