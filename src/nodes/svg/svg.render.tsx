import React from 'react';

import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import { buildSvgAttributes, renderSvgChildren } from './svgShared';
import type { RenderContext } from '../../renderers/types';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export const svgNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const titleNode = node.children.find((child) => child.type === 'title');
  const title = resolveAttributeValue(titleNode?.data, state, loopVariables);

  const children = renderSvgChildren(context);
  // A <title> is the accessible name for an inline svg, and must come first.
  const contents = title ? [React.createElement('title', { key: `${keyPrefix}-title` }, title), ...children] : children;

  return React.createElement(
    'svg',
    {
      key: keyPrefix,
      xmlns: SVG_NAMESPACE,
      // Decorative unless a title gives it an accessible name.
      ...(title ? { role: 'img' } : { 'aria-hidden': 'true' }),
      ...buildSvgAttributes(context),
      style: style as React.CSSProperties | undefined,
    },
    contents.length > 0 ? contents : undefined,
  );
};
