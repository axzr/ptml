import { evaluateExpression, findInnermostExpression } from '../../evaluation/expressions';
import type { Node, ExecutionContext } from '../../types';
import type { StateMap, LoopVariablesMap, ListMap, StateValue } from '../../state/state';

const evaluateNestedExpressions = (
  valueText: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): string => {
  let processedValue = valueText;
  const maxIterations = 100;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;
    const found = findInnermostExpression(processedValue);
    if (!found) {
      break;
    }

    try {
      const expressionResult = evaluateExpression(found.match, state, loopVariables, lists);
      processedValue =
        processedValue.slice(0, found.index) +
        String(expressionResult) +
        processedValue.slice(found.index + found.match.length);
    } catch {
      break;
    }
  }

  return processedValue;
};

const evaluateSetValue = (
  valueText: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue => {
  const hasNestedExpressions = valueText.includes('(') && valueText.includes(')');
  const processedValue = hasNestedExpressions
    ? evaluateNestedExpressions(valueText, state, loopVariables, lists)
    : valueText;
  const wrappedValue =
    processedValue.includes('|') && !processedValue.trim().startsWith('(') ? `(${processedValue})` : processedValue;
  return evaluateExpression(wrappedValue, state, loopVariables, lists);
};

export const processSetOperation = (
  child: Node,
  tempState: StateMap,
  loopVariables?: LoopVariablesMap,
  updatedLists?: ListMap,
): StateMap => {
  const parts = child.data.trim().split(/\s+/);
  if (parts.length < 2) {
    return tempState;
  }

  const variableName = parts[0];
  if (!variableName.startsWith('$')) {
    return tempState;
  }

  const stateKey = variableName.slice(1);
  const valueText = parts.slice(1).join(' ');
  const value = evaluateExpression(valueText, tempState, loopVariables, updatedLists);
  return { ...tempState, [stateKey]: value };
};

export const executeSetOperation = (child: Node, context: ExecutionContext): void => {
  const { setState, loopVariables, lists } = context;

  if (!child.data || !setState) {
    return;
  }

  const parts = child.data.trim().split(/\s+/);
  if (parts.length < 2) {
    return;
  }

  const variableName = parts[0];
  if (!variableName.startsWith('$')) {
    return;
  }

  const stateKey = variableName.slice(1);
  const valueText = parts.slice(1).join(' ');

  setState((prevState: StateMap) => {
    const newState = { ...prevState };
    newState[stateKey] = evaluateSetValue(valueText, prevState, loopVariables, lists);
    return newState;
  });
};
