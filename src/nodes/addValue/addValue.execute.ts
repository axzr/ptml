import { parseStateValue } from '../../state/state';
import { parseListOperationData, processValueWithExpressions } from '../../evaluation/expressions';
import { findListNameFromLoopContext } from '../../listOperations/helpers';
import type { ListMap, StateMap, StateValue, LoopVariablesMap } from '../../state/state';
import type { Node, ExecutionContext } from '../../types';

const addItemToList = (lists: ListMap, listName: string, itemValue: StateValue): ListMap => {
  const newLists = { ...lists };
  const updatedList = [...(newLists[listName] || [])];
  updatedList.push(itemValue);
  newLists[listName] = updatedList;
  return newLists;
};

export const executeAddValueOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName: explicitListName, remainingText: valueText } = parseListOperationData(child.data, lists);

  if (!valueText) {
    return;
  }

  const listName = explicitListName || findListNameFromLoopContext(loopVariables, lists);
  if (!listName || !Array.isArray(lists[listName])) {
    return;
  }

  const processedValue = processValueWithExpressions(valueText, state, loopVariables, lists);
  const parsedValue = parseStateValue(processedValue);

  setLists((prevLists) => addItemToList(prevLists, listName, parsedValue));
};

export const processAddValueOperation = (
  child: Node,
  updatedLists: ListMap,
  tempState: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const newLists = { ...updatedLists };

  executeAddValueOperation(child, {
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
