import type { NodeSchema } from '../../schemas/types';
import { validateTemplate } from './template.validation';

export const templateSchema: NodeSchema = {
  name: 'template',
  category: 'declaration',
  description:
    'Defines a reusable template with optional parameters. Templates can contain any renderable nodes (box, text, button, etc.) and are rendered via show nodes.',
  blocks: {
    isContainerParent: true,
  },
  conditionals: {
    allowed: true,
  },
  data: {
    required: true,
    noRepeats: true,
    format: {
      first: {
        name: 'template name',
        description:
          'The name of the template. Cannot start with $. Template names must be unique within the document.',
        required: true,
        format: {
          type: 'string',
          validator: 'function-name',
        },
      },
      rest: {
        name: 'parameter',
        description:
          'Optional parameter names. Parameters cannot start with $ and must be unique within the template. Parameters are available as variables within the template body.',
        required: false,
        format: {
          type: 'string',
          validator: 'parameter-name',
        },
      },
    },
    min: 1,
  },
  example: 'template: contact-card contact',
  functions: {
    validate: validateTemplate,
    getContext: () => ({ parentNode: undefined }),
  },
};
