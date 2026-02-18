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

const hasNewlineProperty = (node: RenderContext['node']): boolean => {
  const newlineNode = node.children.find((child) => child.type === 'newline');
  return !!newlineNode && newlineNode.data?.trim() !== 'false';
};

export const textNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, namedStyles, state, loopVariables, lists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const content = processTextWithExpressions(node.data || '', state, loopVariables, lists);
  const newline = hasNewlineProperty(node);

  const textContent = style ? React.createElement('span', { style: style as React.CSSProperties }, content) : content;

  if (!newline) return textContent;

  return React.createElement(React.Fragment, null, textContent, React.createElement('br'));
};
