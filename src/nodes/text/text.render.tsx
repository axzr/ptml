import React from 'react';

import { interpolateText, type StateMap, type LoopVariablesMap, type ListMap } from '../../state/state';
import { evaluateExpression } from '../../evaluation/expressions';
import { getNodeStyles } from '../../renderers/helpers';
import { renderNode } from '../../renderers/renderNode';
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

// Nested text nodes are inline runs of the same paragraph: "Open from" plus a
// magenta "9am". Rendering them as real inline elements means the browser owns
// wrapping, line height and the width of a space -- unlike a flex row of boxes,
// whose gap applies to both axes and so adds dead vertical space to wrapped
// lines. The space between runs comes from a leading space in the run's own
// text; see the schema description for why leading spaces survive and trailing
// ones do not.
const renderTextRuns = (context: RenderContext, keyPrefix: string): React.ReactNode[] => {
  const runs: React.ReactNode[] = [];
  const children = context.node.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.category !== 'block') {
      continue;
    }
    const childKey = `${keyPrefix}-${i}`;
    const rendered = renderNode({ ...context, node: child, keyPrefix: childKey, nextSibling: children[i + 1] });
    if (rendered !== null && rendered !== undefined) {
      runs.push(React.createElement(React.Fragment, { key: childKey }, rendered));
    }
  }
  return runs;
};

export const textNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables, lists } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);
  const content = processTextWithExpressions(node.data || '', state, loopVariables, lists);
  const newline = hasNewlineProperty(node);
  const runs = renderTextRuns(context, keyPrefix);

  // A span rather than a fragment when there are runs: the fragment could not
  // carry the data-ptml-* attributes renderNode attaches for the inspector.
  const textContent =
    runs.length > 0
      ? React.createElement('span', { style: style as React.CSSProperties | undefined }, content, ...runs)
      : style
        ? React.createElement('span', { style: style as React.CSSProperties }, content)
        : content;

  if (!newline) return textContent;

  return React.createElement(React.Fragment, null, textContent, React.createElement('br'));
};
