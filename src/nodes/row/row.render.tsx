import React from 'react';
import { getNodeStyles } from '../../renderers/helpers';
import { cellNodeToReactAs } from '../cell/cell.render';
import type { RenderContext } from '../../renderers/types';

export type TableSection = 'header' | 'body' | 'footer';

const getCellTagForSection = (section: TableSection): 'th' | 'td' => (section === 'header' ? 'th' : 'td');

export const rowNodeToReactInSection = (context: RenderContext, section: TableSection): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables, setLists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const tag = getCellTagForSection(section);

  const renderedChildren: React.ReactNode[] = [];

  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type !== 'cell') {
      continue;
    }
    const childKey = `${keyPrefix}-${i}`;
    const nextSibling = node.children.slice(i + 1).find((c) => c.type === 'cell');
    const childContext = {
      ...context,
      node: child,
      keyPrefix: childKey,
      loopVariables,
      setLists,
      nextSibling: nextSibling ?? undefined,
    };

    const rendered = cellNodeToReactAs(childContext, tag);
    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }

  return React.createElement(
    'tr',
    { key: keyPrefix, style: style as React.CSSProperties | undefined },
    renderedChildren,
  );
};

export const rowNodeToReact = (context: RenderContext): React.ReactNode => rowNodeToReactInSection(context, 'body');
