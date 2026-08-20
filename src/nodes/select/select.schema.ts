import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';

export const selectSchema: NodeSchema = {
  name: 'select',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A dropdown select element for forms. Select fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.country). A select needs a binding so that the chosen option goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable. Takes one or more option children; styles are optional.',
  properties: {
    list: [{ name: 'id' }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [{ name: 'option' }],
  },
  data: {
    allowed: false,
  },
  example: '- select:\n  - id: country',
  functions: {
    validate: validateFormField,
    getContext: () => ({ parentNode: 'form' }),
    wrapAsParent: (nodePTML: string) => `ptml:\n> select:\n  - id: country\n${indentChildLines(nodePTML, 2)}`,
  },
};
