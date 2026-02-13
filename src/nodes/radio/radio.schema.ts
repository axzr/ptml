import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { radioNodeToReact } from './radio.render';

export const radioSchema: NodeSchema = {
  name: 'radio',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A radio button input for forms. Multiple radios with the same name form a group; form state holds the selected option value at form.name. Radios require name and value (as key-value children) and can have optional id, selected (state ref for two-way binding), and styles.',
  properties: {
    list: [
      { name: 'name', required: true },
      { name: 'value', required: true },
      { name: 'id' },
      { name: 'selected' },
      { name: 'styles' },
    ],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- radio:',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'form' }),
    render: radioNodeToReact,
  },
};
