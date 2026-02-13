import React from 'react';

import { renderNode } from '../../renderers/renderNode';
import { getItemFromListForListGet, resolveIndexForListGet } from './eachListResolution';
import type { LoopVariablesMap } from '../../state/state';
import type { RenderContext } from '../../renderers/types';
import type { Node as PTMLNode } from '../../types';

const matchEachListGetBinding = (text: string): { listName: string; index: string; variableName: string } | null => {
  const match = text.match(/^([\w.-]+)\s+(\S+)\s+as\s+\$?([\w.-]+)$/);
  if (!match) {
    return null;
  }
  return {
    listName: match[1],
    index: match[2],
    variableName: match[3],
  };
};

const updateLoopVariablesFromListGet = (
  getListName: string,
  resolvedIndex: number,
  variableName: string,
  currentLoopVariables: LoopVariablesMap,
  context: RenderContext,
): LoopVariablesMap => {
  const itemValue = getItemFromListForListGet(
    getListName,
    resolvedIndex,
    context.lists,
    context.state,
    currentLoopVariables,
  );

  if (itemValue !== null) {
    return {
      ...currentLoopVariables,
      [variableName]: itemValue,
    };
  }

  return currentLoopVariables;
};

const renderGrandchildNode = (
  grandchild: PTMLNode,
  j: number,
  child: PTMLNode,
  updatedLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  childIndex: number,
  context: RenderContext,
): React.ReactNode | null => {
  const grandchildKey = `${keyPrefix}-${index}-${childIndex}-${j}`;
  const nextSibling = j < child.children.length - 1 ? child.children[j + 1] : undefined;
  const grandchildContext = {
    ...context,
    node: grandchild,
    keyPrefix: grandchildKey,
    loopVariables: updatedLoopVariables,
    lists: context.lists,
    setLists: context.setLists,
    nextSibling,
  };

  return renderNode(grandchildContext);
};

const renderListGetChildren = (
  child: PTMLNode,
  updatedLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  childIndex: number,
  context: RenderContext,
): React.ReactNode[] => {
  const renderedChildren: React.ReactNode[] = [];

  for (let j = 0; j < child.children.length; j++) {
    const grandchild = child.children[j];
    const grandchildKey = `${keyPrefix}-${index}-${childIndex}-${j}`;
    const rendered = renderGrandchildNode(
      grandchild,
      j,
      child,
      updatedLoopVariables,
      keyPrefix,
      index,
      childIndex,
      context,
    );

    if (rendered) {
      renderedChildren.push(React.createElement(React.Fragment, { key: grandchildKey }, rendered));
    }
  }

  return renderedChildren;
};

export const processListGetNode = (
  child: PTMLNode,
  currentLoopVariables: LoopVariablesMap,
  keyPrefix: string,
  index: number,
  childIndex: number,
  context: RenderContext,
): { updatedLoopVariables: LoopVariablesMap; renderedChildren: React.ReactNode[] } => {
  const trimmed = (child.data || '').trim();
  const asMatch = matchEachListGetBinding(trimmed);

  if (!asMatch) {
    return { updatedLoopVariables: currentLoopVariables, renderedChildren: [] };
  }

  const { listName: getListName, index: indexStr, variableName } = asMatch;
  const resolvedIndex = resolveIndexForListGet(indexStr, currentLoopVariables, context.state);

  if (resolvedIndex === null) {
    return { updatedLoopVariables: currentLoopVariables, renderedChildren: [] };
  }

  const updatedLoopVariables = updateLoopVariablesFromListGet(
    getListName,
    resolvedIndex,
    variableName,
    currentLoopVariables,
    context,
  );

  const renderedChildren = renderListGetChildren(child, updatedLoopVariables, keyPrefix, index, childIndex, context);

  return { updatedLoopVariables, renderedChildren };
};
