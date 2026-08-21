import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { labelNodeToReact } from './label.render';

export const labelSchema: NodeSchema = {
  name: 'label',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A form label that associates text with a form control for accessibility. Use optional "for" (id of the control) to associate with a control elsewhere, or wrap the control and text as children. The for value must name an id declared by a field in the same document, or the label links to nothing; a label may instead wrap its field and need no for at all. A for taken from state (e.g. $target) is resolved at render time.',
  properties: {
    list: [{ name: 'for' }, { name: 'text' }, { name: 'styles' }],
  },
  blocks: {
    isContainerParent: true,
  },
  data: {
    allowed: false,
  },
  example: '- label:\n  - for: email\n  - text: Email',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
    render: labelNodeToReact,
  },
};
