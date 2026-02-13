import { parseListOperationData, processValueWithExpressions } from '../../evaluation/expressions';
import { parseStateValue } from '../../state/state';
import type { StateList, StateValue, StateMap, ListMap, LoopVariablesMap } from '../../state/state';
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

export const executeRemoveValueOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName, remainingText: valueText } = parseListOperationData(child.data, lists);
  if (!listName || !valueText) {
    return;
  }

  const processedValue = processValueWithExpressions(valueText, state, loopVariables, lists);
  const itemValue = parseStateValue(processedValue);

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

export const processRemoveValueOperation = (
  child: Node,
  updatedLists: ListMap,
  tempState: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const newLists = { ...updatedLists };

  executeRemoveValueOperation(child, {
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
