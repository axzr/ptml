import type { NodeSchema } from '../../schemas/types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { textNodeToReact } from './text.render';

export const textSchema: NodeSchema = {
  name: 'text',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    "Displays text content, with interpolated expressions using $variable syntax and pipe expressions, and optional inline styles. A text node may contain further text nodes, which render as inline runs of the same paragraph -- the way to style part of a sentence, such as one magenta word in a headline. Runs flow inline, so wrapping, line height and the width of a space are the browser's rather than something to approximate with a flex row and a gap. Whitespace: exactly one space after the colon separates the node from its text, and any further leading spaces are part of the text -- which is how a run is spaced away from the one before it. Trailing spaces are always stripped, because they are invisible in the source and editors routinely remove them on save, so no document should depend on them.",
  blocks: {
    list: [{ name: 'text' }],
  },
  properties: {
    list: [{ name: 'styles' }, { name: 'newline' }],
  },
  data: {
    required: false,
  },
  example: '- text: Hello',
  functions: {
    validate: validateBlockDefault,
    getContext: () => ({ parentNode: 'box' }),
    render: textNodeToReact,
  },
};
