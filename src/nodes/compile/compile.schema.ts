import type { NodeSchema } from '../../schemas/types';
import { validateCompile } from './compile.validation';
import { compileNodeToReact } from './compile.render';

export const compileSchema: NodeSchema = {
  name: 'compile',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Renders a PTML string from state inline. The data field must be a state variable reference (e.g., $source). The resolved string is parsed as PTML and rendered within the parent context, sharing state.',
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
        name: 'state variable',
        description: 'A state variable reference containing PTML source (e.g., $source).',
        required: true,
        format: {
          type: 'string',
        },
      },
    },
    min: 1,
    max: 1,
    constraints: [
      {
        description: 'data must be a state variable reference starting with $',
        validate: (node) => {
          const data = (node.data || '').trim();
          return data.startsWith('$');
        },
      },
    ],
  },
  example: '> compile: $source',
  functions: {
    validate: validateCompile,
    getContext: () => ({ state: { source: '> text: Hello' }, parentNode: undefined }),
    render: compileNodeToReact,
  },
};
