import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { inputNodeToReact } from './input.render';

export const inputSchema: NodeSchema = {
  name: 'input',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A text input field element. Input fields are typically used within forms and can be accessed via form.fieldName syntax (e.g., form.name). Inputs require an id and type (as key-value children), and can have optional styles.',
  properties: {
    list: [{ name: 'id', required: true }, { name: 'type', required: true }, { name: 'value' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- input:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
    render: inputNodeToReact,
  },
};
