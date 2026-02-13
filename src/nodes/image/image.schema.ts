import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { imageNodeToReact } from './image.render';

export const imageSchema: NodeSchema = {
  name: 'image',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'An image element that displays a picture from a URL. Requires src (as a key-value child); can have optional alt text for accessibility and styles. Src can be a literal URL or a state reference (e.g. $imageUrl).',
  properties: {
    list: [{ name: 'src', required: true }, { name: 'alt' }, { name: 'styles' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- image:\n  - src: https://example.com/photo.jpg\n  - alt: Description',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'box' }),
    render: imageNodeToReact,
  },
};
