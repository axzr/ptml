import React from 'react';

import { renderNode } from '../../renderers/renderNode';
import { evaluateCondition } from '../../evaluation/conditionals';
import type { RenderContext } from '../../renderers/types';
import type { Node } from '../../types';

const renderSingleChild = (
  child: Node,
  i: number,
  childrenArray: Node[],
  context: RenderContext,
  keyPrefix: string,
): React.ReactNode | null => {
  const childKey = `${keyPrefix}-${i}`;
  const nextSibling = i < childrenArray.length - 1 ? childrenArray[i + 1] : undefined;
  const childContext = { ...context, node: child, keyPrefix: childKey, nextSibling };

  return renderNode(childContext);
};

const renderIfChildren = (childrenToRender: Node[], context: RenderContext, keyPrefix: string): React.ReactNode[] => {
  const renderedChildren: React.ReactNode[] = [];

  for (let i = 0; i < childrenToRender.length; i++) {
    const child = childrenToRender[i];
    const rendered = renderSingleChild(child, i, childrenToRender, context, keyPrefix);

    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: `${keyPrefix}-${i}` }, rendered));
    }
  }

  return renderedChildren;
};

export const ifNodeToReact = (context: RenderContext): React.ReactNode | null => {
  const { node, keyPrefix = '', state, loopVariables, nextSibling } = context;

  if (!node.data) {
    return null;
  }

  const condition = node.data;
  const isTrue = evaluateCondition(condition, state, loopVariables);

  const elseNode = nextSibling?.type === 'else' ? nextSibling : undefined;

  const childrenToRender = isTrue ? node.children : elseNode?.children || [];

  if (childrenToRender.length === 0) {
    return null;
  }

  const renderedChildren = renderIfChildren(childrenToRender, context, keyPrefix);

  if (renderedChildren.length === 0) {
    return null;
  }

  if (renderedChildren.length === 1) {
    return renderedChildren[0];
  }

  return React.createElement(React.Fragment, { key: keyPrefix }, ...renderedChildren);
};
