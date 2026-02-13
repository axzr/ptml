import { parseListUpdateData } from '../../parsers/listUpdateParser';
import { parseWhereCondition } from '../../parsers/listUpdateParser';
import { getVariableValue } from '../../evaluation/conditionals';
import { parseExpectedValue } from '../../evaluation/conditionals';
import { buildStateObjectFromNode, setItemInList } from '../../listOperations/helpers';
import { OperationErrors } from '../../errors/messages';
import type { Node, ExecutionContext } from '../../types';
import type { ListMap, LoopVariablesMap, StateList, StateMap, StateValue } from '../../state/state';

const getNestedPropertyValue = (obj: StateValue, propertyPath: string): StateValue | undefined => {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return undefined;
  }

  const parts = propertyPath.split('.');
  let current: StateValue = obj;

  for (const part of parts) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, StateValue>)[part];
    if (current === undefined) {
      return undefined;
    }
  }

  return current;
};

const findItemIndexByProperty = (list: StateList, propertyName: string, matchValue: StateValue): number | null => {
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const itemPropertyValue = getNestedPropertyValue(item, propertyName);

    if (itemPropertyValue === matchValue) {
      return i;
    }

    if (itemPropertyValue === undefined || matchValue === undefined) {
      continue;
    }

    if (String(itemPropertyValue) === String(matchValue)) {
      return i;
    }

    const itemNum = typeof itemPropertyValue === 'number' ? itemPropertyValue : Number(itemPropertyValue);
    const matchNum = typeof matchValue === 'number' ? matchValue : Number(matchValue);

    if (!isNaN(itemNum) && !isNaN(matchNum) && itemNum === matchNum) {
      return i;
    }
  }

  return null;
};

const resolveMatchValue = (matchValueText: string, state: StateMap, loopVariables?: LoopVariablesMap): StateValue => {
  if (matchValueText.startsWith('$')) {
    const variablePath = matchValueText.substring(1);
    const value = getVariableValue(variablePath, state, loopVariables);
    return value !== undefined ? value : matchValueText;
  }

  if (loopVariables && matchValueText in loopVariables) {
    return loopVariables[matchValueText];
  }

  if (state && matchValueText in state) {
    return state[matchValueText];
  }

  return parseExpectedValue(matchValueText) ?? matchValueText;
};

const validateUpdateRecordInputs = (
  updateNode: Node,
  listName: string | null,
  lists: ListMap | undefined,
): { whereNode: Node; recordNode: Node } => {
  if (!listName) {
    throw new Error(OperationErrors.missingListName(updateNode.type, updateNode.lineNumber));
  }

  if (!lists || !(listName in lists)) {
    throw new Error(OperationErrors.listNotFound(updateNode.type, updateNode.lineNumber, listName));
  }

  if (!Array.isArray(lists[listName])) {
    throw new Error(OperationErrors.notAList(updateNode.type, updateNode.lineNumber, listName));
  }

  const whereNode = updateNode.children.find((child) => child.type === 'where');
  if (!whereNode) {
    throw new Error(OperationErrors.missingWhereChild(updateNode.type, updateNode.lineNumber));
  }

  const recordNode = updateNode.children.find((child) => child.type === 'record');
  if (!recordNode) {
    throw new Error(OperationErrors.missingRecordChild(updateNode.type, updateNode.lineNumber));
  }

  return { whereNode, recordNode };
};

const findMatchingItemIndex = (
  updateNode: Node,
  whereNode: Node,
  listName: string,
  list: StateList,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): number => {
  const { propertyName, matchValue: matchValueText } = parseWhereCondition(whereNode);
  if (!propertyName || !matchValueText) {
    throw new Error(OperationErrors.invalidWhereCondition(whereNode.lineNumber));
  }

  const matchValue = resolveMatchValue(matchValueText, state, loopVariables);
  const itemIndex = findItemIndexByProperty(list, propertyName, matchValue);

  if (itemIndex === null) {
    throw new Error(
      OperationErrors.noMatchingItem(updateNode.type, updateNode.lineNumber, listName, propertyName, matchValueText),
    );
  }

  return itemIndex;
};

export const executeUpdateRecordOperation = (child: Node, context: ExecutionContext): void => {
  const { state, lists, setLists, loopVariables } = context;

  if (!lists || !setLists) {
    return;
  }

  const { listName } = parseListUpdateData(child.data);
  const { whereNode, recordNode } = validateUpdateRecordInputs(child, listName, lists);
  const list = lists[listName!];
  const itemIndex = findMatchingItemIndex(child, whereNode, listName!, list, state, loopVariables);
  const recordValue = buildStateObjectFromNode(recordNode, state, loopVariables, lists);
  setLists((prevLists) => setItemInList(prevLists, listName!, itemIndex, recordValue));
};

export const processUpdateRecordOperation = (
  updateNode: Node,
  lists: ListMap,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): ListMap => {
  const { listName } = parseListUpdateData(updateNode.data);
  const { whereNode, recordNode } = validateUpdateRecordInputs(updateNode, listName, lists);
  const list = lists[listName!];
  const itemIndex = findMatchingItemIndex(updateNode, whereNode, listName!, list, state, loopVariables);
  const recordValue = buildStateObjectFromNode(recordNode, state, loopVariables, lists);
  return setItemInList(lists, listName!, itemIndex, recordValue);
};
