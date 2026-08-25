import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';
import React from 'react';

import { renderNodesToReact } from '../../renderers/renderCoordinator';
import { buildInteractionStylesheet } from '../../styles/interactionStyles';

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
    render: (context) => {
      const content = renderNodesToReact(
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
        context.onFontsUnavailable,
      );

      // One stylesheet per document, carrying the rules for every named style
      // that has interaction states. Deterministic, so prerendered markup and
      // the hydrating client produce the same thing.
      const css = buildInteractionStylesheet(context.namedStyles, context.state, context.loopVariables);
      if (!css) {
        return content;
      }
      return React.createElement(
        React.Fragment,
        null,
        React.createElement('style', { key: 'ptml-interaction-styles', dangerouslySetInnerHTML: { __html: css } }),
        content,
      );
    },
  },
};
