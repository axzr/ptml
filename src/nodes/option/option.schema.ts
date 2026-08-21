import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { optionNodeToReact } from './option.render';

export const optionSchema: NodeSchema = {
  name: 'option',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'An option element for select dropdowns. Option elements define the choices available in a select dropdown. The data field contains the display text (visible to the user), and a value key-value child specifies the option value. The display text is interpolated like any other text, so "$country.name" works for options generated inside an each, and the value child accepts a state reference in the same way.',
  properties: {
    list: [{ name: 'value', required: true }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: true,
  },
  example: '- option: Display Text',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'select' }),
    render: optionNodeToReact,
  },
};
