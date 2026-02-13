import { evaluateExpression } from '../evaluation/expressions';
import { StateErrors } from '../errors/messages';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { isNumericValue, extractAllVariableReferences } from '../utils/regexPatterns';
import type { Node } from '../types';
import type { NodeSchema } from '../schemas/types';

export type StateList = StateValue[];
export type StateValue = string | number | boolean | null | { [key: string]: StateValue } | StateValue[];
export type StateMap = Record<string, StateValue>;

export type ListMap = Record<string, StateList>;
export type LoopVariablesMap = Record<string, StateValue>;

const VARIABLE_REFERENCE_PATTERN = /\$([A-Za-z0-9_.-]+)/g;

const checkReference = (referenceName: string, context: BuildContext, contextType: 'state' | 'list'): void => {
  if (referenceName in context.stateMap || referenceName in context.lists) {
    return;
  }

  throw new Error(
    StateErrors.undefinedVariableReference(
      contextType,
      context.parentVariableName,
      context.parentLineNumber,
      referenceName,
    ),
  );
};

export const parseStateValue = (raw: string): StateValue => {
  const trimmed = raw.trim();
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (trimmed === 'null') {
    return null;
  }
  if (isNumericValue(trimmed)) {
    return Number(trimmed);
  }
  return trimmed;
};

const extractVariableReferences = (expression: string): string[] => {
  const allRefs = extractAllVariableReferences(expression);
  const references: string[] = [];
  for (const ref of allRefs) {
    const varName = ref.split('.')[0];
    if (!references.includes(varName)) {
      references.push(varName);
    }
  }
  return references;
};

type BuildContext = {
  stateMap: StateMap;
  lists: ListMap;
  nodes: Node[];
  currentNodeIndex: number;
  parentLineNumber: number;
  parentVariableName?: string;
};

const validatePipeReferences = (references: string[], context: BuildContext): void => {
  for (const ref of references) {
    checkReference(ref, context, 'state');
  }
};

const processPipeExpression = (trimmedData: string, context: BuildContext): StateValue => {
  const references = extractVariableReferences(trimmedData);
  validatePipeReferences(references, context);
  const wrappedExpression = `(${trimmedData})`;
  return evaluateExpression(wrappedExpression, context.stateMap, undefined, context.lists);
};

const processStateVariableReference = (trimmedData: string, context: BuildContext): void => {
  const varName = trimmedData.slice(1).split('.')[0];
  checkReference(varName, context, 'state');
};

const processStateNodeData = (trimmedData: string, preserveStrings: boolean, context: BuildContext): StateValue => {
  if (preserveStrings) {
    return trimmedData;
  }
  if (trimmedData.includes('|')) {
    return processPipeExpression(trimmedData, context);
  }
  if (trimmedData.startsWith('$')) {
    processStateVariableReference(trimmedData, context);
  }
  return parseStateValue(trimmedData);
};

const processArrayItem = (child: Node, context: BuildContext): StateValue => {
  if (child.type === 'value' || child.data) {
    return processListItemData(child.data?.trim() || '', context);
  }
  if (child.type) {
    return child.type;
  }
  return '';
};

const buildStateArrayFromChildren = (node: Node, context: BuildContext): StateValue[] => {
  const listContext: BuildContext = {
    ...context,
    parentLineNumber: node.lineNumber,
  };
  return node.children.map((child) => processArrayItem(child, listContext));
};

const buildStateObjectFromChildren = (
  node: Node,
  preserveStrings: boolean,
  context: BuildContext,
): Record<string, StateValue> => {
  const obj: Record<string, StateValue> = {};
  node.children.forEach((child) => {
    const childContext: BuildContext = {
      ...context,
      parentLineNumber: child.lineNumber,
      parentVariableName: child.type,
    };
    obj[child.type] = buildStateFromNodeContent(child, preserveStrings, childContext);
  });
  return obj;
};

const isStateArray = (node: Node): boolean => {
  if (node.children.length === 0) {
    return false;
  }
  return node.children.every((child) => child.category === 'property' && !child.data && child.type !== 'record');
};

const buildStateFromNodeContent = (node: Node, preserveStrings: boolean, context: BuildContext): StateValue => {
  if (node.children.length > 0) {
    if (isStateArray(node)) {
      return buildStateArrayFromChildren(node, context);
    }
    return buildStateObjectFromChildren(node, preserveStrings, context);
  }
  if (node.data) {
    return processStateNodeData(node.data.trim(), preserveStrings, context);
  }
  return '';
};

const processListItemStateReference = (varName: string, context: BuildContext): StateValue | null => {
  if (!(varName in context.stateMap)) {
    checkReference(varName, context, 'list');
  }
  if (varName in context.stateMap) {
    return context.stateMap[varName];
  }
  return null;
};

const processListItemData = (trimmedData: string, context: BuildContext): StateValue => {
  if (trimmedData.startsWith('$')) {
    const varName = trimmedData.slice(1);
    const stateValue = processListItemStateReference(varName, context);
    if (stateValue !== null) {
      return stateValue;
    }
  }
  return parseStateValue(trimmedData);
};

const processValueListItem = (child: Node, context: BuildContext): StateValue => {
  return processListItemData(child.data?.trim() || '', context);
};

const processRecordListItem = (child: Node, context: BuildContext): StateValue => {
  return buildStateFromNodeContent(child, true, context);
};

const buildValueListFromNode = (node: Node, context: BuildContext): StateList => {
  const listContext: BuildContext = {
    ...context,
    parentLineNumber: node.lineNumber,
  };
  return node.children.map((child) => processValueListItem(child, listContext));
};

const buildRecordListFromNode = (node: Node, context: BuildContext): StateList => {
  const listContext: BuildContext = {
    ...context,
    parentLineNumber: node.lineNumber,
  };
  return node.children.map((child) => processRecordListItem(child, listContext));
};

const processStateNode = (node: Node, context: BuildContext, state: StateMap): void => {
  node.children.forEach((child) => {
    const childContext: BuildContext = {
      ...context,
      parentLineNumber: child.lineNumber,
      parentVariableName: child.type,
    };
    state[child.type] = buildStateFromNodeContent(child, false, childContext);
  });
};

const processListInitialization = (node: Node, schema: NodeSchema, context: BuildContext, lists: ListMap): void => {
  const listName = node.data?.trim();
  if (!listName) {
    return;
  }

  if (schema.listItemType === 'value') {
    lists[listName] = buildValueListFromNode(node, context);
  } else if (schema.listItemType === 'record') {
    lists[listName] = buildRecordListFromNode(node, context);
  }
};

export const buildStateAndLists = (nodes: Node[]): { state: StateMap; lists: ListMap } => {
  const state: StateMap = {};
  const lists: ListMap = {};

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const context: BuildContext = {
      stateMap: state,
      lists,
      nodes,
      currentNodeIndex: i,
      parentLineNumber: node.lineNumber,
    };

    const schema = getSchemaMap().get(node.type);
    if (!schema || schema.category !== 'declaration') {
      continue;
    }

    if (schema.initializesState) {
      processStateNode(node, context, state);
    } else if (schema.initializesLists) {
      processListInitialization(node, schema, context, lists);
    }
  }

  return { state, lists };
};

const getNestedValue = (obj: StateValue, path: string[]): StateValue | undefined => {
  if (path.length === 0) {
    return obj;
  }
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }
  if (Array.isArray(obj)) {
    return undefined;
  }
  const [first, ...rest] = path;
  const nextValue = obj[first];
  if (nextValue === undefined) {
    return undefined;
  }
  return getNestedValue(nextValue, rest);
};

export const resolveVariable = (
  path: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): string | undefined => {
  const parts = path.split('.');
  const [first, ...rest] = parts;

  let rootValue: StateValue | undefined;

  if (loopVariables && first in loopVariables) {
    rootValue = loopVariables[first];
  } else if (first in state) {
    rootValue = state[first];
  } else {
    return undefined;
  }

  if (rootValue === undefined) {
    return undefined;
  }

  if (typeof rootValue !== 'object' || rootValue === null) {
    return rest.length === 0 ? String(rootValue) : undefined;
  }

  const value = rest.length > 0 ? getNestedValue(rootValue, rest) : rootValue;
  return value !== undefined ? String(value) : undefined;
};

export const interpolateText = (text: string, state: StateMap, loopVariables?: LoopVariablesMap): string => {
  return text.replace(VARIABLE_REFERENCE_PATTERN, (match, path: string) => {
    const value = resolveVariable(path, state, loopVariables);
    return value !== undefined ? value : match;
  });
};
