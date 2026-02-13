import { parseStateValue } from '../state/state';
import { processValueWithExpressions } from '../evaluation/expressions';
import type { Node } from '../types';
import type { ListMap, LoopVariablesMap, StateMap, StateValue } from '../state/state';

export const LOOP_CONTEXT_LIST_NAME_KEY = '__listName';

const findListNameByMatchingItem = (loopVariables: LoopVariablesMap, lists: ListMap): string | null => {
  for (const [listName, list] of Object.entries(lists)) {
    if (Array.isArray(list)) {
      for (const item of list) {
        for (const varValue of Object.values(loopVariables)) {
          if (varValue === item) {
            return listName;
          }
        }
      }
    }
  }
  return null;
};

export const findListNameFromLoopContext = (loopVariables?: LoopVariablesMap, lists?: ListMap): string | null => {
  if (!loopVariables || !lists) {
    return null;
  }

  const listName = loopVariables[LOOP_CONTEXT_LIST_NAME_KEY];
  if (typeof listName === 'string' && listName in lists) {
    return listName;
  }

  return findListNameByMatchingItem(loopVariables, lists);
};

export const buildStateObjectFromNode = (
  node: Node,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue => {
  if (node.children.length > 0) {
    const obj: Record<string, StateValue> = {};
    node.children.forEach((child) => {
      obj[child.type] = buildStateObjectFromNode(child, state, loopVariables, lists);
    });
    return obj;
  }
  if (node.data) {
    const trimmed = node.data.trim();
    if (trimmed.includes('$') || trimmed.includes('|')) {
      const processed = processValueWithExpressions(trimmed, state, loopVariables, lists);
      return parseStateValue(processed);
    }
    if (loopVariables && trimmed in loopVariables) {
      return loopVariables[trimmed];
    }
    if (state && trimmed in state) {
      return state[trimmed];
    }
    return parseStateValue(trimmed);
  }
  return '';
};

export const setItemInList = (lists: ListMap, listName: string, index: number, itemValue: StateValue): ListMap => {
  const newLists = { ...lists };
  const currentList = [...(newLists[listName] || [])];

  while (currentList.length <= index) {
    currentList.push('');
  }

  currentList[index] = itemValue;
  newLists[listName] = currentList;

  return newLists;
};
