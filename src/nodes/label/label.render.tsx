import React from 'react';
import { getNodeStyles } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
import type { RenderContext } from '../../renderers/types';

export const labelNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables, setLists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const forNode = node.children.find((child) => child.type === 'for');
  const htmlFor = forNode?.data?.trim() || undefined;

  const renderedChildren: React.ReactNode[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const childKey = `${keyPrefix}-${i}`;
    const nextSibling = i < node.children.length - 1 ? node.children[i + 1] : undefined;
    const childContext = { ...context, node: child, keyPrefix: childKey, loopVariables, setLists, nextSibling };

    const rendered = renderNode(childContext);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }

  return React.createElement(
    'label',
    {
      key: keyPrefix,
      htmlFor,
      style: style as React.CSSProperties | undefined,
    },
    renderedChildren,
  );
};
