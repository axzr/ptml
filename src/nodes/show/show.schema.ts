import type { NodeSchema } from '../../schemas/types';
import { validateShow } from './show.validation';
import { showNodeToReact } from './show.render';

export const showSchema: NodeSchema = {
  name: 'show',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Renders a template by name with optional arguments. The template name can be a literal name or a state variable reference (e.g., $page). Arguments can be given positionally after the template name, which is convenient for single words and variable references, or as named children -- one per parameter, e.g. "- label: Back in stock soon". Named arguments are the only way to pass a value containing spaces, because positional arguments are separated by spaces; they can also be given in any order and omitted individually. The two styles cannot be mixed in one call. A parameter with no argument is empty, so templates can treat parameters as optional.',
  blocks: {
    list: [],
  },
  properties: {
    // Named template arguments are property children whose names come from the
    // template being shown, so they cannot be listed here; validateShow checks
    // them against that template's declared parameters.
    allowAny: true,
    description: 'styles, plus one child per template parameter (e.g. "- label: Back in stock soon").',
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
