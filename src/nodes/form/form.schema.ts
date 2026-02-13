import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { formNodeToReact } from './form.render';

export const formSchema: NodeSchema = {
  name: 'form',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A form container element that groups form inputs and buttons together. Form fields can be accessed via form.fieldName syntax (e.g., form.name, form.email). Forms can contain inputs, buttons, text, styles, and other container elements.',
  blocks: {
    isContainerParent: true,
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  data: {
    allowed: false,
  },
  example: '- form:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: formNodeToReact,
  },
};
