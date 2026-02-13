import React from 'react';

import { renderNode } from '../../renderers/renderNode';
import { evaluateBreakpointCondition } from '../../evaluation/breakpoints';
import type { RenderContext } from '../../renderers/types';
import type { Node } from '../../types';

const renderBreakpointChildren = (children: Node[], context: RenderContext, keyPrefix: string): React.ReactNode[] => {
  const renderedChildren: React.ReactNode[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childKey = `${keyPrefix}-${i}`;
    const nextSibling = i < children.length - 1 ? children[i + 1] : undefined;
    const childContext = { ...context, node: child, keyPrefix: childKey, nextSibling };
    const rendered = renderNode(childContext);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }
  return renderedChildren;
};

export const breakpointNodeToReact = (context: RenderContext): React.ReactNode | null => {
  const { node, keyPrefix = '', viewportWidth, breakpoints } = context;

  if (viewportWidth === undefined || breakpoints === undefined || !node.data) {
    return null;
  }

  const isMatch = evaluateBreakpointCondition(viewportWidth, breakpoints, node.data.trim());
  if (!isMatch || node.children.length === 0) {
    return null;
  }

  const renderedChildren = renderBreakpointChildren(node.children, context, keyPrefix);
  if (renderedChildren.length === 0) {
    return null;
  }

  return React.createElement(React.Fragment, {}, ...renderedChildren);
};
