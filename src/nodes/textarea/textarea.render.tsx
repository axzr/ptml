import React from 'react';

import { getNodeStyles, resolveAttributeValue } from '../../renderers/helpers';
import { createFieldChangeHandler, getFieldValue } from '../../renderers/formFieldBinding';
import type { RenderContext } from '../../renderers/types';

export const textareaNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, setState, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const idNode = node.children.find((child) => child.type === 'id');
  // Resolved rather than taken literally, so an id can be per-item inside an
  // each ("- id: $task.id"); a bare literal would give every row the same id.
  const id = resolveAttributeValue(idNode?.data, state, loopVariables);

  const valueNode = node.children.find((child) => child.type === 'value');
  const defaultValue = valueNode?.data?.trim() || '';

  const placeholderNode = node.children.find((child) => child.type === 'placeholder');
  const placeholder = resolveAttributeValue(placeholderNode?.data, state, loopVariables);

  const currentValue = getFieldValue(defaultValue, id, state, loopVariables);
  const onChange = createFieldChangeHandler(defaultValue, id, setState);

  return React.createElement(
    'textarea',
    {
      key: keyPrefix,
      // Omitted rather than empty: id="" is invalid HTML and would make a
      // label's "- for:" match nothing.
      id: id || undefined,
      style: style as React.CSSProperties | undefined,
      value: currentValue,
      onChange,
      // Omitted rather than empty so the attribute is absent from the DOM.
      placeholder: placeholder || undefined,
    },
    null,
  );
};
