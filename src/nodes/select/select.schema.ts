import type { NodeSchema } from '../../schemas/types';
import { validateFormField } from '../../validation/validators/validateFormField';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import { selectNodeToReact } from './select.render';
import { SelectErrors } from '../../errors/messages';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';

// An option-producing child means the select could legitimately be empty at
// runtime -- a host-supplied list with no records yet -- which is not an error.
// A select with no such child can never have options at all, which is.
const CAN_PRODUCE_OPTIONS = new Set(['option', 'each', 'if', 'else', 'show']);

const validateSelect = (node: Node, context: ValidationContext): void => {
  validateFormField(node, context);
  if (node.category !== 'block') {
    return;
  }
  if (!node.children.some((child) => CAN_PRODUCE_OPTIONS.has(child.type))) {
    throw new Error(SelectErrors.noOptions(node.lineNumber));
  }
};

export const selectSchema: NodeSchema = {
  name: 'select',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A dropdown select element for forms. Select fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.country). A select needs a binding so that the chosen option goes somewhere: either an id, which binds it to form.<id>, or a value bound to a state variable. Takes one or more option children; styles are optional. An id must be unique across the document, since two fields sharing one would share a single form value and produce duplicate ids in the page; the exception is fields in different branches of a conditional, which never render together. Inside an each or range, use a per-item id such as "- id: $item.key" rather than a fixed one, which would repeat for every item. Options may be written out directly, or generated with an each over a list, and may be guarded by if/else or come from a template via show. A select must contain at least one of these; a select with no way to produce options renders a dropdown with nothing to choose. A list that happens to be empty at runtime is fine. Other block nodes are not allowed inside a select, because a select element may only hold options.',
  properties: {
    list: [{ name: 'id' }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    // Deliberately a hand-maintained list rather than the container children:
    // a select element may only hold options in the DOM. each, if/else and show
    // are allowed because they render as fragments, so the options they produce
    // still end up as direct children of the select.
    list: [{ name: 'option' }, { name: 'each' }, { name: 'if' }, { name: 'else' }, { name: 'show' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '- select:\n  - id: country',
  functions: {
    validate: validateSelect,
    getContext: () => ({ parentNode: 'form' }),
    render: selectNodeToReact,
    wrapAsParent: (nodePTML: string) => `ptml:\n> select:\n  - id: country\n${indentChildLines(nodePTML, 2)}`,
  },
};
