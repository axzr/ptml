import React from 'react';

import { renderNode } from '../../renderers/renderNode';
import { processListGetNode } from './eachListGetProcessor';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { parseEachNodeData } from '../../parsers/eachParser';
import type { RenderContext } from '../../renderers/types';
import type { LoopVariablesMap } from '../../state/state';
import type { Node } from '../../types';

const createChildContext = (
  child: Node,
  childIndex: number,
  currentLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  context: RenderContext,
): RenderContext => ({
  ...context,
  node: child,
  keyPrefix: `${keyPrefix}-${index}-${childIndex}`,
  loopVariables: currentLoopVariables,
  lists: context.lists,
  setLists: context.setLists,
});

const renderChildNode = (
  child: Node,
  childIndex: number,
  currentLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  context: RenderContext,
  node: Node,
): React.ReactNode | null => {
  const nextSibling = childIndex < node.children.length - 1 ? node.children[childIndex + 1] : undefined;
  const childContext = {
    ...createChildContext(child, childIndex, currentLoopVariables, keyPrefix, index, context),
    nextSibling,
  };

  return renderNode(childContext);
};

const processSpecialChildNode = (
  child: Node,
  childIndex: number,
  currentLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  context: RenderContext,
): { updatedLoopVariables: LoopVariablesMap; renderedChildren: React.ReactNode[]; shouldContinue: boolean } => {
  if (!child.data) {
    return { updatedLoopVariables: currentLoopVariables, renderedChildren: [], shouldContinue: false };
  }

  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(child.type);
  if (!schema || schema.category !== 'action') {
    return { updatedLoopVariables: currentLoopVariables, renderedChildren: [], shouldContinue: false };
  }

  if (schema.skipsRenderingInLoops) {
    return { updatedLoopVariables: currentLoopVariables, renderedChildren: [], shouldContinue: true };
  }

  if (schema.updatesLoopVariables) {
    const result = processListGetNode(child, currentLoopVariables, keyPrefix, index, childIndex, context);
    return {
      updatedLoopVariables: result.updatedLoopVariables,
      renderedChildren: result.renderedChildren,
      shouldContinue: true,
    };
  }

  return { updatedLoopVariables: currentLoopVariables, renderedChildren: [], shouldContinue: false };
};

const processChildInLoop = (
  child: Node,
  childIndex: number,
  currentLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  context: RenderContext,
  node: Node,
): {
  updatedLoopVariables: LoopVariablesMap;
  renderedChildren: React.ReactNode[];
} => {
  const specialResult = processSpecialChildNode(child, childIndex, currentLoopVariables, keyPrefix, index, context);

  if (specialResult.shouldContinue) {
    return {
      updatedLoopVariables: specialResult.updatedLoopVariables,
      renderedChildren: specialResult.renderedChildren,
    };
  }

  const rendered = renderChildNode(child, childIndex, currentLoopVariables, keyPrefix, index, context, node);
  const childKey = `${keyPrefix}-${index}-${childIndex}`;

  return {
    updatedLoopVariables: currentLoopVariables,
    renderedChildren: rendered ? [React.createElement(React.Fragment, { key: childKey }, rendered)] : [],
  };
};

export const processEachItemChildren = (
  node: Node,
  itemLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  context: RenderContext,
): React.ReactNode[] => {
  const parsed = parseEachNodeData(node.data);
  const listName = parsed?.listName;
  const contextWithDataSource = listName
    ? { ...context, dataSourceInfo: { type: 'list' as const, listName, itemIndex: index } }
    : context;

  let currentLoopVariables = itemLoopVariables;
  const renderedChildren: React.ReactNode[] = [];

  for (let childIndex = 0; childIndex < node.children.length; childIndex++) {
    const child = node.children[childIndex];
    const result = processChildInLoop(
      child,
      childIndex,
      currentLoopVariables,
      keyPrefix,
      index,
      contextWithDataSource,
      node,
    );

    currentLoopVariables = result.updatedLoopVariables;
    renderedChildren.push(...result.renderedChildren);
  }

  return renderedChildren;
};
