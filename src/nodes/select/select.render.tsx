import React from 'react';

import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
import { createFieldChangeHandler, getFieldValue } from '../../renderers/formFieldBinding';
import type { RenderContext } from '../../renderers/types';

// each, if/else and show all render as fragments, so options nested inside them
// still land as direct children of the select element, as the DOM requires.
const renderSelectChildren = (context: RenderContext): React.ReactNode[] => {
  const { node, keyPrefix = '' } = context;
  const rendered: React.ReactNode[] = [];
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.category !== 'block' && child.category !== 'conditional') {
      continue;
    }
    const childKey = `${keyPrefix}-${i}`;
    const element = renderNode({ ...context, node: child, keyPrefix: childKey, nextSibling: children[i + 1] });
    if (element) {
      rendered.push(React.createElement(React.Fragment, { key: childKey }, element));
    }
  }
  return rendered;
};

export const selectNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, setState, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const idNode = node.children.find((child) => child.type === 'id');
  const id = resolveAttributeValue(idNode?.data, state, loopVariables);

  const valueNode = node.children.find((child) => child.type === 'value');
  const defaultValue = valueNode?.data?.trim() || '';

  return React.createElement(
    'select',
    {
      key: keyPrefix,
      id: id || undefined,
      style: style as React.CSSProperties | undefined,
      value: getFieldValue(defaultValue, id, state, loopVariables),
      onChange: createFieldChangeHandler(defaultValue, id, setState),
    },
    renderSelectChildren(context),
  );
};
