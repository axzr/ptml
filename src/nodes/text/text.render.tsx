import React from 'react';

import { interpolateText, type StateMap, type LoopVariablesMap, type ListMap } from '../../state/state';
import { evaluateExpression } from '../../evaluation/expressions';
import { getNodeStyles } from '../../renderers/helpers';
import type { RenderContext } from '../../renderers/types';

const EXPRESSION_PATTERN = /\(([^)]+)\)/g;

const processTextWithExpressions = (
  text: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): string => {
  let processedText = interpolateText(text, state, loopVariables);
  const expressionRegex = EXPRESSION_PATTERN;
  const maxIterations = 100;
  let iterations = 0;

  while (expressionRegex.test(processedText) && iterations < maxIterations) {
    iterations++;
    expressionRegex.lastIndex = 0;
    processedText = processedText.replace(expressionRegex, (match) => {
      try {
        const expressionResult = evaluateExpression(match, state, loopVariables, lists);
        return String(expressionResult);
      } catch {
        return match;
      }
    });
  }

  return processedText;
};

export const textNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, namedStyles, state, loopVariables, lists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const content = processTextWithExpressions(node.data || '', state, loopVariables, lists);
  if (!style) {
    return content;
  }

  return React.createElement('span', { style: style as React.CSSProperties }, content);
};
