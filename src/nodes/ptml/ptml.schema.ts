import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';
import { renderNodesToReact } from '../../renderers/renderCoordinator';

export const ptmlSchema: NodeSchema = {
  name: 'ptml',
  category: 'declaration',
  description:
    'The only renderable root node. Contains blocks that define the user interface. Optional: 0 or 1 per file.',
  isRenderable: true,
  blocks: {
    isContainerParent: true,
  },
  data: {
    allowed: false,
  },
  example: 'ptml:',
  functions: {
    validate: validateDeclarationDefault,
    getContext: () => ({ parentNode: undefined }),
    render: (context) =>
      renderNodesToReact(
        context.node.children,
        context.namedStyles,
        context.state,
        context.lists,
        context.setState,
        context.setLists,
        context.functionMap,
        context.templateMap,
        context.setError,
        context.viewportWidth,
        context.breakpoints,
        context.sourceFilename,
        context.templateSourceMap,
        context.files,
      ),
  },
};
