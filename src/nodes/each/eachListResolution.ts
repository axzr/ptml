import type { LoopVariablesMap, StateMap, StateValue } from '../../state/state';

const getRootValue = (
  key: string,
  state: StateMap | undefined,
  loopVariables: LoopVariablesMap | undefined,
): StateValue | undefined => {
  if (loopVariables && key in loopVariables) {
    return loopVariables[key];
  }
  if (state && key in state) {
    return state[key];
  }
  return undefined;
};

const traverseNestedPath = (rootValue: StateValue, pathParts: string[]): StateValue | null => {
  let value: StateValue | undefined = rootValue;
  for (const part of pathParts) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return null;
    }
    value = value[part];
    if (value === undefined) {
      return null;
    }
  }
  return value;
};

export const resolveNestedPath = (
  path: string[],
  state: StateMap | undefined,
  loopVariables: LoopVariablesMap | undefined,
): StateValue | null => {
  const [first, ...rest] = path;
  const rootValue = getRootValue(first, state, loopVariables);

  if (rootValue === undefined) {
    return null;
  }

  if (rest.length === 0) {
    return rootValue;
  }

  if (typeof rootValue !== 'object' || rootValue === null || Array.isArray(rootValue)) {
    return null;
  }

  return traverseNestedPath(rootValue, rest);
};

const getListFromLists = (listName: string, lists: Record<string, StateValue[]> | undefined): StateValue[] | null => {
  if (lists && listName in lists) {
    return lists[listName];
  }
  return null;
};

const getListFromNestedPath = (
  listName: string,
  state: StateMap | undefined,
  loopVariables: LoopVariablesMap | undefined,
): StateValue[] | null => {
  const path = listName.split('.');
  const value = resolveNestedPath(path, state, loopVariables);
  return value !== null && Array.isArray(value) ? value : null;
};

const getListFromVariables = (
  listName: string,
  loopVariables: LoopVariablesMap | undefined,
  state: StateMap | undefined,
): StateValue[] | null => {
  if (loopVariables && listName in loopVariables) {
    const value = loopVariables[listName];
    return Array.isArray(value) ? value : null;
  }

  if (state && listName in state) {
    const value = state[listName];
    return Array.isArray(value) ? value : null;
  }

  return null;
};

export const resolveListFromState = (
  listName: string,
  state: StateMap | undefined,
  loopVariables: LoopVariablesMap | undefined,
  lists: Record<string, StateValue[]> | undefined,
): StateValue[] | null => {
  const fromLists = getListFromLists(listName, lists);
  if (fromLists) {
    return fromLists;
  }

  if (listName.includes('.')) {
    return getListFromNestedPath(listName, state, loopVariables);
  }

  return getListFromVariables(listName, loopVariables, state);
};

const getIndexFromVariable = (
  varName: string,
  currentLoopVariables: LoopVariablesMap,
  state?: StateMap,
): number | null => {
  const value =
    varName in currentLoopVariables
      ? currentLoopVariables[varName]
      : state && varName in state
        ? state[varName]
        : undefined;

  if (value === undefined || value === null) {
    return null;
  }

  const numericValue = typeof value === 'number' ? value : Number(value);
  if (isNaN(numericValue) || numericValue < 0) {
    return null;
  }

  return Math.floor(numericValue);
};

const getIndexFromLiteral = (indexStr: string): number | null => {
  const numericIndex = Number(indexStr);
  if (isNaN(numericIndex) || numericIndex < 0) {
    return null;
  }
  return Math.floor(numericIndex);
};

export const resolveIndexForListGet = (
  indexStr: string,
  currentLoopVariables: LoopVariablesMap,
  state?: StateMap,
): number | null => {
  if (indexStr.startsWith('$')) {
    const varName = indexStr.slice(1);
    return getIndexFromVariable(varName, currentLoopVariables, state);
  }

  return getIndexFromLiteral(indexStr);
};

const getItemFromArray = (list: StateValue[], index: number): StateValue | null => {
  if (Array.isArray(list) && index >= 0 && index < list.length) {
    return list[index];
  }
  return null;
};

export const getItemFromListForListGet = (
  getListName: string,
  resolvedIndex: number,
  lists?: Record<string, StateValue[]>,
  state?: StateMap,
  currentLoopVariables?: LoopVariablesMap,
): StateValue | null => {
  if (lists && getListName in lists) {
    const result = getItemFromArray(lists[getListName], resolvedIndex);
    if (result !== null) {
      return result;
    }
  }

  if (state && getListName in state) {
    const result = getItemFromArray(state[getListName] as StateValue[], resolvedIndex);
    if (result !== null) {
      return result;
    }
  }

  if (currentLoopVariables && getListName in currentLoopVariables) {
    const result = getItemFromArray(currentLoopVariables[getListName] as StateValue[], resolvedIndex);
    if (result !== null) {
      return result;
    }
  }

  return null;
};
