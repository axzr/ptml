import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { executeClickHandler } from '../../renderers/clickHandler';
import { interpolateText } from '../../state/state';
import { evaluateCondition } from '../../evaluation/conditionals';
import type { RenderContext } from '../../renderers/types';

export const buttonNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const textNode = node.children.find((child) => child.type === 'text');
  const buttonText = textNode ? interpolateText(textNode.data, state, loopVariables) : '';

  const clickNode = node.children.find((child) => child.type === 'click');
  const onClick =
    clickNode && (context.setState || context.setLists || context.functionMap)
      ? () => {
          executeClickHandler(clickNode, context);
        }
      : undefined;

  const disabledNode = node.children.find((child) => child.type === 'disabled');
  const disabled =
    disabledNode && disabledNode.data ? evaluateCondition(disabledNode.data, state, loopVariables) : false;

  return React.createElement(
    'button',
    { key: keyPrefix, style: style as React.CSSProperties | undefined, onClick, disabled },
    buttonText,
  );
};
