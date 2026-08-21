import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { checkboxNodeToReact } from './checkbox.render';

export const checkboxSchema: NodeSchema = {
  name: 'checkbox',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A checkbox input field for forms. Checkboxes can be accessed via form.fieldName syntax (e.g., form.agree). A checkbox needs a binding so that its checked state goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable (e.g. - value: $agree). Styles are optional. An id must be unique across the document, since two fields sharing one would share a single form value and produce duplicate ids in the page; the exception is fields in different branches of a conditional, which never render together. Inside an each or range, use a per-item id such as "- id: $item.key" rather than a fixed one, which would repeat for every item.',
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
