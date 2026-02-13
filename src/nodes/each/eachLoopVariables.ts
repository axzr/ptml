import { LOOP_CONTEXT_LIST_NAME_KEY } from '../../listOperations/helpers';
import type { LoopVariablesMap, StateValue } from '../../state/state';

export const buildItemLoopVariables = (
  item: StateValue,
  index: number,
  listName: string,
  itemVariableName?: string,
  indexVariableName?: string,
  parentLoopVariables?: LoopVariablesMap,
): LoopVariablesMap => {
  const itemLoopVariables: LoopVariablesMap = {
    ...(parentLoopVariables || {}),
    [LOOP_CONTEXT_LIST_NAME_KEY]: listName,
  };

  if (itemVariableName) {
    itemLoopVariables[itemVariableName] = item;
  }

  if (indexVariableName) {
    itemLoopVariables[indexVariableName] = index;
  }

  return itemLoopVariables;
};
