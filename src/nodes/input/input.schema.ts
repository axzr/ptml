import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { inputNodeToReact } from './input.render';

export const inputSchema: NodeSchema = {
  name: 'input',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A text input field element. Input fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.name). An input needs a binding so that what is typed goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable (e.g. - value: $name). Type is optional and defaults to text. Placeholder and styles are optional. Placeholder can be a literal string or a state reference (e.g. $hint). An id must be unique across the document, since two fields sharing one would share a single form value and produce duplicate ids in the page; the exception is fields in different branches of a conditional, which never render together. Inside an each or range, use a per-item id such as "- id: $item.key" rather than a fixed one, which would repeat for every item.',
  properties: {
    list: [{ name: 'id' }, { name: 'type' }, { name: 'value' }, { name: 'placeholder' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- input:\n  - id: name\n  - type: text',
  functions: {
    validate: validateFormField,
    getContext: () => ({ parentNode: 'form' }),
    render: inputNodeToReact,
  },
};
