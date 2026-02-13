import React from 'react';
import { getNodeStyles } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
import type { RenderContext } from '../../renderers/types';

const BOX_ROLE_TAGS = new Set(['main', 'header', 'footer', 'article', 'section', 'nav', 'aside']);

const getBoxTag = (node: RenderContext['node']): string => {
  const roleChild = node.children.find((child) => child.type === 'role');
  const value = roleChild?.data?.trim().toLowerCase();
  if (value && BOX_ROLE_TAGS.has(value)) {
    return value;
  }
  return 'div';
};

export const boxNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables, setLists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const tag = getBoxTag(node);

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
    tag,
    { key: keyPrefix, style: style as React.CSSProperties | undefined },
    renderedChildren,
  );
};
