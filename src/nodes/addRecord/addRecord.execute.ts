import { findListNameFromLoopContext, buildStateObjectFromNode } from '../../listOperations/helpers';
import type { ListMap, LoopVariablesMap, StateMap, StateValue } from '../../state/state';
import type { Node, ExecutionContext } from '../../types';

const addItemToList = (lists: ListMap, listName: string, itemValue: StateValue): ListMap => {
  const newLists = { ...lists };
  const updatedList = [...(newLists[listName] || [])];
  updatedList.push(itemValue);
  newLists[listName] = updatedList;
  return newLists;
};

const extractListNameForRecord = (
  data: string | undefined,
  lists: ListMap,
  loopVariables?: LoopVariablesMap,
): string | null => {
  const trimmedData = (data || '').trim();
  const parts = trimmedData.split(/\s+/);
  const firstPart = parts[0];

  if (firstPart && lists && firstPart in lists) {
    return firstPart;
  }

  return findListNameFromLoopContext(loopVariables, lists);
};

export const executeAddRecordOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const recordChild = child.children.find((c) => c.type === 'record');

  if (!recordChild) {
    return;
  }

  const listName = extractListNameForRecord(child.data, lists, loopVariables);

  if (!listName || !Array.isArray(lists[listName])) {
    return;
  }

  const recordValue = buildStateObjectFromNode(recordChild, state, loopVariables, lists);
  setLists((prevLists) => addItemToList(prevLists, listName, recordValue));
};

export const processAddRecordOperation = (
  child: Node,
  updatedLists: ListMap,
  tempState: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const newLists = { ...updatedLists };

  executeAddRecordOperation(child, {
    state: tempState,
    setState: () => {},
    lists: newLists,
    setLists: (updater) => {
      Object.assign(newLists, updater(newLists));
    },
    loopVariables,
  });

  return newLists;
};
