import { parseStateValue } from '../../state/state';
import { processValueWithExpressions } from '../../evaluation/expressions';
import { parseListSetData as parseListSetDataShared } from '../../parsers/listSetParser';
import { setItemInList } from '../../listOperations/helpers';
import type { Node, ExecutionContext } from '../../types';
import type { ListMap, LoopVariablesMap, StateMap, StateValue } from '../../state/state';

const parseUpdateValueData = (
  data: string | undefined,
  lists: ListMap,
): { listName: string | null; index: string | null; valueExpression: string | null } => {
  const parsed = parseListSetDataShared(data);
  if (!parsed.listName) {
    return parsed;
  }

  if (parsed.listName in lists) {
    return parsed;
  }

  return { listName: null, index: null, valueExpression: null };
};

const resolveIndex = (index: string, state: StateMap, loopVariables?: LoopVariablesMap): number | null => {
  if (index.startsWith('$')) {
    const varName = index.slice(1);
    let value: StateValue | undefined;

    if (loopVariables && varName in loopVariables) {
      value = loopVariables[varName];
    } else if (varName in state) {
      value = state[varName];
    }

    if (value === undefined || value === null) {
      return null;
    }

    const numericValue = typeof value === 'number' ? value : Number(value);
    if (isNaN(numericValue) || numericValue < 0) {
      return null;
    }

    return Math.floor(numericValue);
  }

  const numericIndex = Number(index);
  if (isNaN(numericIndex) || numericIndex < 0) {
    return null;
  }

  return Math.floor(numericIndex);
};

export const executeUpdateValueOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName, index, valueExpression } = parseUpdateValueData(child.data, lists);

  if (!listName || !index || !valueExpression) {
    return;
  }

  if (!Array.isArray(lists[listName])) {
    return;
  }

  const resolvedIndex = resolveIndex(index, state, loopVariables);
  if (resolvedIndex === null) {
    return;
  }

  const processedValue = processValueWithExpressions(valueExpression, state, loopVariables, lists);
  const parsedValue = parseStateValue(processedValue);

  setLists((prevLists) => setItemInList(prevLists, listName, resolvedIndex, parsedValue));
};

export const processUpdateValueOperation = (
  updateNode: Node,
  lists: ListMap,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const { listName, index, valueExpression } = parseUpdateValueData(updateNode.data, lists);

  if (!listName || !index || !valueExpression) {
    return lists;
  }

  if (!Array.isArray(lists[listName])) {
    return lists;
  }

  const resolvedIndex = resolveIndex(index, state, loopVariables);
  if (resolvedIndex === null) {
    return lists;
  }

  const processedValue = processValueWithExpressions(valueExpression, state, loopVariables, lists);
  const parsedValue = parseStateValue(processedValue);

  return setItemInList(lists, listName, resolvedIndex, parsedValue);
};
