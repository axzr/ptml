import type { StateMap, LoopVariablesMap, StateValue } from '../state/state';
import { matchSingleVariableReference } from '../utils/regexPatterns';

const getNestedValue = (obj: { [key: string]: StateValue }, path: string[]): StateValue | undefined => {
  if (path.length === 0) {
    return obj;
  }
  const [first, ...rest] = path;
  const nextValue = obj[first];
  if (nextValue === undefined) {
    return undefined;
  }
  if (typeof nextValue !== 'object' || nextValue === null) {
    return rest.length === 0 ? nextValue : undefined;
  }
  return getNestedValue(nextValue as { [key: string]: StateValue }, rest);
};

export const getVariableValue = (
  path: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): StateValue | undefined => {
  const parts = path.split('.');
  const [first, ...rest] = parts;

  let rootValue: StateValue | undefined;

  if (loopVariables && first in loopVariables) {
    rootValue = loopVariables[first];
  } else if (first in state) {
    rootValue = state[first];
  } else {
    return undefined;
  }

  if (rootValue === undefined) {
    return undefined;
  }

  if (typeof rootValue !== 'object' || rootValue === null) {
    return rest.length === 0 ? rootValue : undefined;
  }

  return rest.length > 0 ? getNestedValue(rootValue as { [key: string]: StateValue }, rest) : rootValue;
};

export const parseExpectedValue = (expectedText: string): StateValue | undefined => {
  const trimmed = expectedText.trim();
  if (trimmed === 'undefined') {
    return undefined;
  }
  if (trimmed === 'null') {
    return null;
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
};

const isEmpty = (value: StateValue | undefined): boolean => {
  return value === undefined || value === null || value === '';
};

const matchVariableIsCondition = (text: string): { variablePath: string; value: string } | null => {
  const match = text.match(/^\$([A-Za-z0-9_.-]+)\s+is\s+(.+)$/);
  if (!match) {
    return null;
  }
  return {
    variablePath: match[1],
    value: match[2].trim(),
  };
};

const evaluateSimpleVariable = (expression: string, state: StateMap, loopVariables?: LoopVariablesMap): boolean => {
  const variablePath = matchSingleVariableReference(expression);
  if (!variablePath) {
    return false;
  }
  const variableValue = getVariableValue(variablePath, state, loopVariables);

  if (typeof variableValue === 'boolean') {
    return variableValue;
  }

  return !!variableValue;
};

const evaluateIsCondition = (expression: string, state: StateMap, loopVariables?: LoopVariablesMap): boolean => {
  const isMatch = matchVariableIsCondition(expression);
  if (!isMatch) {
    return false;
  }

  const variablePath = isMatch.variablePath;
  const expectedValueText = isMatch.value;

  const variableValue = getVariableValue(variablePath, state, loopVariables);

  if (expectedValueText === 'empty') {
    return isEmpty(variableValue);
  }
  if (expectedValueText === 'not empty') {
    return !isEmpty(variableValue);
  }

  let expectedValue: StateValue | undefined;
  if (expectedValueText.startsWith('$')) {
    const expectedVariablePath = expectedValueText.substring(1);
    expectedValue = getVariableValue(expectedVariablePath, state, loopVariables);
  } else {
    expectedValue = parseExpectedValue(expectedValueText);
  }

  if (expectedValue === undefined) {
    return variableValue === undefined;
  }

  if (variableValue === undefined) {
    return false;
  }

  return variableValue === expectedValue;
};

export const evaluateCondition = (expression: string, state: StateMap, loopVariables?: LoopVariablesMap): boolean => {
  if (!expression) {
    return false;
  }

  const simpleVariableResult = evaluateSimpleVariable(expression, state, loopVariables);
  if (simpleVariableResult !== false || !expression.includes(' is ')) {
    return simpleVariableResult;
  }

  return evaluateIsCondition(expression, state, loopVariables);
};
