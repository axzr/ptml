import React from 'react';
import type { RenderContext } from '../../renderers/types';
import { parseEachNodeData } from '../../parsers/eachParser';
import { resolveListFromState } from './eachListResolution';
import { buildItemLoopVariables } from './eachLoopVariables';
import { processEachItemChildren } from './eachChildRenderer';

export const eachNodeToReact = (context: RenderContext): React.ReactNode[] => {
  const { node, keyPrefix = '', lists, loopVariables, state } = context;
  const parsed = parseEachNodeData(node.data);
  if (!parsed) {
    return [];
  }

  const { listName, itemVariableName, indexVariableName } = parsed;
  const list = resolveListFromState(listName, state, loopVariables, lists);

  if (!list || list.length === 0) {
    return [];
  }

  return list.map((item, index) => {
    const itemLoopVariables = buildItemLoopVariables(
      item,
      index,
      listName,
      itemVariableName,
      indexVariableName,
      loopVariables,
    );

    const children = processEachItemChildren(node, itemLoopVariables, keyPrefix, index, context);
    return React.createElement(React.Fragment, { key: `${keyPrefix}-${index}` }, ...children);
  });
};
