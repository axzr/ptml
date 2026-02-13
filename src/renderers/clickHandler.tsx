import { evaluateExpression } from '../evaluation/expressions';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import type { Node } from '../types';
import type { StateMap, LoopVariablesMap, ListMap } from '../state/state';
import type { ExecutionContext } from '../types';
import type { RenderContext } from './types';

const computeUpdatedLists = (
  clickNode: Node,
  lists: ListMap,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  let updatedLists = { ...lists };
  let tempState = { ...state };
  const schemaMap = getSchemaMap();

  clickNode.children.forEach((child) => {
    if (!child.data) {
      return;
    }

    const schema = schemaMap.get(child.type);
    if (!schema || schema.category !== 'action') {
      return;
    }

    const stateHandler = schema.functions.stateOperationHandler;
    if (stateHandler) {
      tempState = stateHandler(child, tempState, loopVariables, updatedLists);
      return;
    }

    const listHandler = schema.functions.listOperationHandler;
    if (listHandler) {
      updatedLists = listHandler(child, updatedLists, tempState, loopVariables);
    }
  });

  return updatedLists;
};

const tryApplySetOperation = (
  child: Node,
  partialState: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateMap | null => {
  if (child.type !== 'set' || !child.data) {
    return null;
  }
  const parts = child.data.trim().split(/\s+/);
  if (parts.length < 2) {
    return null;
  }
  const variableName = parts[0];
  if (!variableName.startsWith('$')) {
    return null;
  }
  const stateKey = variableName.slice(1);
  const valueText = parts.slice(1).join(' ');
  try {
    const value = evaluateExpression(valueText, partialState, loopVariables, lists);
    return { ...partialState, [stateKey]: value };
  } catch {
    return null;
  }
};

const computePartialUpdatedState = (
  clickNode: Node,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateMap => {
  let partialState = { ...state };

  clickNode.children.forEach((child) => {
    const nextState = tryApplySetOperation(child, partialState, loopVariables, lists);
    if (nextState !== null) {
      partialState = nextState;
    }
  });

  return partialState;
};

const processClickChild = (
  child: Node,
  context: RenderContext,
  partialUpdatedState: StateMap,
  updatedLists?: ListMap,
): void => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(child.type);
  const execute = schema?.functions?.execute;
  if (!execute) {
    return;
  }

  const executionContext: ExecutionContext = {
    state: partialUpdatedState,
    setState: context.setState,
    lists: updatedLists,
    setLists: context.setLists,
    loopVariables: context.loopVariables,
    functionMap: context.functionMap,
    setError: context.setError,
  };

  try {
    execute(child, executionContext);
    executionContext.setError?.(null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (executionContext.setError) {
      executionContext.setError(errorMessage);
    } else {
      throw error;
    }
  }
};

export const executeClickHandler = (clickNode: Node, context: RenderContext): void => {
  const { state, loopVariables, lists } = context;
  const partialUpdatedState = computePartialUpdatedState(clickNode, state, loopVariables, lists);
  const updatedLists = lists ? computeUpdatedLists(clickNode, lists, partialUpdatedState, loopVariables) : lists;

  clickNode.children.forEach((child) => {
    processClickChild(child, context, partialUpdatedState, updatedLists);
  });
};
