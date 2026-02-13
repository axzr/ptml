import type { NodeSchema } from '../../schemas/types';
import { validateShow } from './show.validation';
import { showNodeToReact } from './show.render';

export const showSchema: NodeSchema = {
  name: 'show',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Renders a template by name with optional arguments. The template name can be a literal name or a state variable reference (e.g., $page). Arguments are bound to template parameters.',
  blocks: {
    list: [],
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'template name',
        description:
          'The name of the template to render, or a state variable reference (e.g., $page) for dynamic template selection.',
        required: true,
        format: {
          type: 'string',
          validator: 'template-reference',
        },
      },
      rest: {
        name: 'argument',
        description:
          'Optional argument values to pass to the template. Can be literal values or variable references (e.g., $contact).',
        required: false,
        format: {
          type: 'string',
        },
      },
    },
    min: 1,
  },
  example: '- show: contact-card $contact',
  functions: {
    validate: validateShow,
    getContext: () => ({ state: { page: 'home' }, parentNode: undefined }),
    render: showNodeToReact,
  },
};
