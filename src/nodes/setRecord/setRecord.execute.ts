import { parseListSetData as parseListSetDataShared } from '../../parsers/listSetParser';
import { setItemInList, buildStateObjectFromNode } from '../../listOperations/helpers';
import type { Node, ExecutionContext } from '../../types';
import type { ListMap, LoopVariablesMap, StateMap, StateValue } from '../../state/state';

const parseSetRecordData = (
  data: string | undefined,
  lists: ListMap,
): { listName: string | null; index: string | null } => {
  const parsed = parseListSetDataShared(data);
  if (!parsed.listName || !parsed.index) {
    return { listName: null, index: null };
  }

  if (parsed.listName in lists) {
    return { listName: parsed.listName, index: parsed.index };
  }

  return { listName: null, index: null };
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

export const executeSetRecordOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName, index } = parseSetRecordData(child.data, lists);

  if (!listName || !index) {
    return;
  }

  const recordChild = child.children.find((c) => c.type === 'record');
  if (!recordChild) {
    return;
  }

  if (!Array.isArray(lists[listName])) {
    return;
  }

  const resolvedIndex = resolveIndex(index, state, loopVariables);
  if (resolvedIndex === null) {
    return;
  }

  const recordValue = buildStateObjectFromNode(recordChild, state, loopVariables, lists);
  setLists((prevLists) => setItemInList(prevLists, listName, resolvedIndex, recordValue));
};

export const processSetRecordOperation = (
  setNode: Node,
  lists: ListMap,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const { listName, index } = parseSetRecordData(setNode.data, lists);

  if (!listName || !index) {
    return lists;
  }

  const recordChild = setNode.children.find((child) => child.type === 'record');
  if (!recordChild) {
    return lists;
  }

  if (!Array.isArray(lists[listName])) {
    return lists;
  }

  const resolvedIndex = resolveIndex(index, state, loopVariables);
  if (resolvedIndex === null) {
    return lists;
  }

  const recordValue = buildStateObjectFromNode(recordChild, state, loopVariables, lists);
  return setItemInList(lists, listName, resolvedIndex, recordValue);
};
