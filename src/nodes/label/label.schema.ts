import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { labelNodeToReact } from './label.render';

export const labelSchema: NodeSchema = {
  name: 'label',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A form label that associates text with a form control for accessibility. Use optional "for" (id of the control) to associate with a control elsewhere, or wrap the control and text as children.',
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
