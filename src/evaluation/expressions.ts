import type { StateMap, StateValue, LoopVariablesMap, ListMap, StateList } from '../state/state';
import { parseStateValue, interpolateText } from '../state/state';

const parseArgsWithNestedExpressions = (argsText: string): string[] => {
  const args: string[] = [];
  let currentArg = '';
  let depth = 0;

  for (let i = 0; i < argsText.length; i++) {
    const char = argsText[i];
    if (char === '(') {
      depth++;
      currentArg += char;
    } else if (char === ')') {
      depth--;
      currentArg += char;
    } else if (char === ' ' && depth === 0) {
      if (currentArg.trim()) {
        args.push(currentArg.trim());
        currentArg = '';
      }
    } else {
      currentArg += char;
    }
  }

  if (currentArg.trim()) {
    args.push(currentArg.trim());
  }

  return args.filter((arg) => arg.length > 0);
};

const parsePipeExpression = (expression: string): { args: string[]; functionName: string } | null => {
  const trimmed = expression.trim();
  if (!trimmed.startsWith('(') || !trimmed.endsWith(')')) {
    return null;
  }

  const content = trimmed.slice(1, -1).trim();
  const pipeIndex = content.lastIndexOf('|');
  if (pipeIndex === -1) {
    return null;
  }

  const argsText = content.slice(0, pipeIndex).trim();
  const functionPart = content.slice(pipeIndex + 1).trim();

  if (!functionPart) {
    return null;
  }

  const functionParts = parseArgsWithNestedExpressions(functionPart);
  if (functionParts.length === 0) {
    return null;
  }

  const functionName = functionParts[functionParts.length - 1];
  const additionalArgs = functionParts.slice(0, -1);
  const args = [...parseArgsWithNestedExpressions(argsText), ...additionalArgs];

  return { args, functionName };
};

const getRootValue = (
  first: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue | StateList | undefined => {
  if (loopVariables && first in loopVariables) {
    return loopVariables[first];
  }
  if (lists && first in lists) {
    return lists[first];
  }
  if (first in state) {
    return state[first];
  }
  return undefined;
};

const resolveNestedValue = (rootValue: StateValue | StateList, rest: string[]): StateValue => {
  if (typeof rootValue !== 'object' || rootValue === null) {
    return rest.length === 0 ? (rootValue as StateValue) : 0;
  }

  if (Array.isArray(rootValue)) {
    return rest.length === 0 ? (rootValue as StateValue) : 0;
  }

  let value: StateValue | undefined = rootValue;
  for (const part of rest) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return 0;
    }
    value = value[part];
    if (value === undefined) {
      return 0;
    }
  }

  return value ?? 0;
};

const resolveArgument = (
  arg: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue => {
  const trimmed = arg.trim();

  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    return evaluateExpression(trimmed, state, loopVariables, lists);
  }

  if (trimmed.startsWith('$')) {
    const path = trimmed.slice(1);
    const parts = path.split('.');
    const [first, ...rest] = parts;

    const rootValue = getRootValue(first, state, loopVariables, lists);
    if (rootValue === undefined) {
      return 0;
    }

    return resolveNestedValue(rootValue, rest);
  }

  return parseStateValue(trimmed);
};

const toNumber = (value: StateValue): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return 0;
};

const add = (args: StateValue[]): StateValue => {
  const numbers = args.map(toNumber);
  return numbers.reduce((sum, num) => sum + num, 0);
};

const subtract = (args: StateValue[]): StateValue => {
  const numbers = args.map(toNumber);
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return -numbers[0];
  return numbers.reduce((result, num) => result - num);
};

const multiply = (args: StateValue[]): StateValue => {
  const numbers = args.map(toNumber);
  if (numbers.length === 0) return 0;
  return numbers.reduce((product, num) => product * num, 1);
};

const divide = (args: StateValue[]): StateValue => {
  const numbers = args.map(toNumber);
  if (numbers.length < 2) return 0;
  const result = numbers.slice(1).reduce((result, num) => {
    if (num === 0) return result;
    return result / num;
  }, numbers[0]);
  return isFinite(result) ? result : 0;
};

const length = (args: StateValue[]): StateValue => {
  if (args.length === 0) return 0;
  const firstArg = args[0];
  if (Array.isArray(firstArg)) {
    return firstArg.length;
  }
  if (typeof firstArg === 'string') {
    return firstArg.length;
  }
  return 0;
};

const pipeFunctions: Record<string, (args: StateValue[]) => StateValue> = {
  add,
  subtract,
  multiply,
  divide,
  length,
};

const evaluatePrefixOperator = (
  expression: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue | null => {
  const trimmed = expression.trim();
  if (trimmed.startsWith('!')) {
    const rest = trimmed.slice(1).trim();
    if (rest.startsWith('$')) {
      const value = resolveArgument(rest, state, loopVariables, lists);
      return !value;
    }
  }
  return null;
};

export const evaluateExpression = (
  expression: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue => {
  const prefixResult = evaluatePrefixOperator(expression, state, loopVariables, lists);
  if (prefixResult !== null) {
    return prefixResult;
  }

  const parsed = parsePipeExpression(expression);
  if (!parsed) {
    const trimmed = expression.trim();
    const isVariableReference = trimmed.startsWith('$');
    if (isVariableReference) {
      return resolveArgument(trimmed, state, loopVariables, lists);
    }
    return parseStateValue(expression);
  }

  const { args, functionName } = parsed;
  const fn = pipeFunctions[functionName];
  if (!fn) {
    return parseStateValue(expression);
  }

  const resolvedArgs = args.map((arg) => resolveArgument(arg, state, loopVariables, lists));
  return fn(resolvedArgs);
};

export const parseListOperationData = (
  data: string | undefined,
  lists: ListMap,
): { listName: string | null; remainingText: string | null } => {
  if (!data) {
    return { listName: null, remainingText: null };
  }

  const trimmed = data.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length < 2) {
    return { listName: null, remainingText: null };
  }

  const firstPart = parts[0];
  const remainingText = parts.slice(1).join(' ');

  if (firstPart in lists) {
    return { listName: firstPart, remainingText };
  }

  return { listName: null, remainingText: trimmed };
};

export const extractItemValueFromReference = (
  itemReference: string,
  loopVariables?: LoopVariablesMap,
): StateValue | null => {
  if (!itemReference.startsWith('$')) {
    return null;
  }
  const variableName = itemReference.slice(1);
  const itemValue = loopVariables?.[variableName];
  return itemValue !== undefined ? itemValue : null;
};

export const findInnermostExpression = (text: string): { match: string; index: number } | null => {
  let depth = 0;
  let startIndex = -1;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === '(') {
      if (depth === 0) {
        startIndex = i;
      }
      depth++;
    } else if (text[i] === ')') {
      depth--;
      if (depth === 0 && startIndex !== -1) {
        return { match: text.slice(startIndex, i + 1), index: startIndex };
      }
    }
  }

  return null;
};

export const processValueWithExpressions = (
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

  processedValue = interpolateText(processedValue, state, loopVariables);
  return processedValue;
};
