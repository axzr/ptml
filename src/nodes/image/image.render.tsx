import React from 'react';

import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import type { RenderContext } from '../../renderers/types';

export const imageNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const srcNode = node.children.find((child) => child.type === 'src');
  const src = resolveAttributeValue(srcNode?.data, state, loopVariables);

  const altNode = node.children.find((child) => child.type === 'alt');
  const alt = resolveAttributeValue(altNode?.data, state, loopVariables);

  return React.createElement('img', {
    key: keyPrefix,
    src,
    alt: alt || undefined,
    style: style as React.CSSProperties | undefined,
  });
};
