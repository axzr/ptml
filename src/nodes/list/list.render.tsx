import React from 'react';
import { getNodeStyles } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
import type { RenderContext } from '../../renderers/types';

const getListTagAndStyle = (
  typeValue: string,
  baseStyle: React.CSSProperties | undefined,
): { tag: 'ul' | 'ol'; style: React.CSSProperties | undefined } => {
  const normalized = typeValue.trim().toLowerCase();

  if (normalized === 'unordered' || normalized === '') {
    return { tag: 'ul', style: baseStyle };
  }

  if (normalized === 'ordered') {
    return { tag: 'ol', style: baseStyle };
  }

  const listStyleType = normalized;
  const style = baseStyle ? { ...baseStyle, listStyleType } : { listStyleType };

  return { tag: 'ol', style };
};

export const listNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables, setLists } = context;
  const typeNode = node.children.find((child) => child.type === 'type');
  const typeValue = typeNode?.data?.trim().toLowerCase() || 'unordered';
  const baseStyle = getNodeStyles(
    node,
    namedStyles,
    state,
    loopVariables,
    context.viewportWidth,
    context.breakpoints,
  ) as React.CSSProperties | undefined;
  const { tag, style } = getListTagAndStyle(typeValue, baseStyle);

  const renderedChildren: React.ReactNode[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type !== 'listItem') {
      continue;
    }
    const childKey = `${keyPrefix}-${i}`;
    const nextSibling = node.children.slice(i + 1).find((c) => c.type === 'listItem');
    const childContext = {
      ...context,
      node: child,
      keyPrefix: childKey,
      loopVariables,
      setLists,
      nextSibling: nextSibling ?? undefined,
    };

    const rendered = renderNode(childContext);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }

  return React.createElement(tag, { key: keyPrefix, style }, renderedChildren);
};
