import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { executeClickHandler } from '../../renderers/clickHandler';
import { resolveVariable, interpolateText } from '../../state/state';
import { renderNode } from '../../renderers/renderNode';
import type { RenderContext } from '../../renderers/types';

const getResolvedHref = (
  hrefData: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): string => {
  if (!hrefData) {
    return '#';
  }
  if (hrefData.trim().startsWith('$')) {
    const resolved = resolveVariable(hrefData.trim().slice(1), state, loopVariables);
    return typeof resolved === 'string' ? resolved : String(resolved ?? '#');
  }
  return hrefData.trim() || '#';
};

const getLinkContent = (context: RenderContext, keyPrefix: string, textContent: string): React.ReactNode[] | string => {
  const renderedChildren: React.ReactNode[] = [];
  for (let i = 0; i < context.node.children.length; i++) {
    const child = context.node.children[i];
    const childKey = `${keyPrefix}-${i}`;
    const nextSibling = i < context.node.children.length - 1 ? context.node.children[i + 1] : undefined;
    const childContext = { ...context, node: child, keyPrefix: childKey, nextSibling };
    const rendered = renderNode(childContext);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }
  return renderedChildren.length > 0 ? renderedChildren : textContent;
};

export const linkNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables);

  const hrefNode = node.children.find((child) => child.type === 'href');
  const hrefData = hrefNode?.data?.trim() || '';
  const href = getResolvedHref(hrefData, state, loopVariables);

  const targetNode = node.children.find((child) => child.type === 'target');
  const target = targetNode?.data?.trim() || undefined;

  const textNode = node.children.find((child) => child.type === 'text');
  const textContent = textNode?.data ? interpolateText(textNode.data, state, loopVariables) : '';

  const clickNode = node.children.find((child) => child.type === 'click');
  const onClick =
    clickNode && (context.setState || context.setLists || context.functionMap)
      ? (e: React.MouseEvent) => {
          e.preventDefault();
          executeClickHandler(clickNode, context);
        }
      : undefined;

  const content = getLinkContent(context, keyPrefix, textContent);

  return React.createElement(
    'a',
    {
      key: keyPrefix,
      href,
      target: target || undefined,
      style: style as React.CSSProperties | undefined,
      onClick,
    },
    content,
  );
};
