import { parseListOperationData, extractItemValueFromReference } from '../../evaluation/expressions';
import type { StateList, StateValue, ListMap, LoopVariablesMap } from '../../state/state';
import type { Node, ExecutionContext } from '../../types';

const removeItemFromList = (list: StateList, itemValue: StateValue): StateList => {
  const indexToRemove = list.findIndex((item) => item === itemValue);
  if (indexToRemove === -1) {
    return list;
  }
  const updatedList = [...list];
  updatedList.splice(indexToRemove, 1);
  return updatedList;
};

export const executeRemoveRecordOperation = (child: Node, context: ExecutionContext): void => {
  const { lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName, remainingText } = parseListOperationData(child.data, lists);
  if (!listName || !remainingText) {
    return;
  }

  const itemValue = extractItemValueFromReference(remainingText, loopVariables);
  if (itemValue === null) {
    return;
  }

  if (!Array.isArray(lists[listName])) {
    return;
  }

  setLists((prevLists) => {
    const newLists = { ...prevLists };
    const updatedList = removeItemFromList(newLists[listName] || [], itemValue);
    newLists[listName] = updatedList;
    return newLists;
  });
};

export const processRemoveRecordOperation = (
  child: Node,
  updatedLists: ListMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const newLists = { ...updatedLists };

  executeRemoveRecordOperation(child, {
    state: {},
    setState: () => {},
    lists: newLists,
    setLists: (updater) => {
      Object.assign(newLists, updater(newLists));
    },
    loopVariables,
  });

  return newLists;
};
