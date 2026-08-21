import React from 'react';

import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import { interpolateText } from '../../state/state';
import type { RenderContext } from '../../renderers/types';

export const optionNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const valueNode = node.children.find((child) => child.type === 'value');
  const value = resolveAttributeValue(valueNode?.data, state, loopVariables);
  // The label is the node's own data, interpolated like any other text so that
  // "$country.name" works for options generated from a list.
  const label = interpolateText(node.data || '', state, loopVariables);

  return React.createElement(
    'option',
    { key: keyPrefix, value, style: style as React.CSSProperties | undefined },
    label,
  );
};
