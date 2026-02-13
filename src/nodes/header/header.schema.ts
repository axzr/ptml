import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { headerNodeToReact } from './header.render';

export const headerSchema: NodeSchema = {
  name: 'header',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'A heading element that renders as HTML h1–h6. Optional data specifies the level (h1–h6); default is h1. Content comes from children (e.g. text).',
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
    allowed: true,
    required: false,
    format: {
      first: {
        name: 'heading level',
        description: 'Optional h1, h2, h3, h4, h5, or h6. Default is h1.',
        required: false,
        format: {
          type: 'string',
          validator: 'heading-level',
        },
      },
    },
  },
  example: '> header: h1',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: undefined }),
    render: headerNodeToReact,
  },
};
