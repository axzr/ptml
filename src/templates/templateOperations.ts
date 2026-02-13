import { parseStateValue } from '../state/state';
import type { Node } from '../types';
import type { StateMap, LoopVariablesMap, ListMap, StateValue } from '../state/state';

export type TemplateMap = Record<string, Node>;

export const buildTemplateMap = (nodes: Node[]): TemplateMap => {
  const templates: TemplateMap = {};

  nodes.forEach((node) => {
    if (node.type === 'template' && node.data) {
      const parts = node.data.trim().split(/\s+/);
      if (parts.length > 0) {
        const templateName = parts[0];
        templates[templateName] = node;
      }
    }
  });

  return templates;
};

export const parseTemplateParameters = (node: Node): string[] => {
  if (!node.data) {
    return [];
  }
  const parts = node.data.trim().split(/\s+/);
  return parts.slice(1);
};

export const parseTemplateArguments = (node: Node): string[] => {
  if (!node.data) {
    return [];
  }
  const parts = node.data.trim().split(/\s+/);
  return parts.slice(1);
};

const resolveArgumentValue = (
  argText: string,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): StateValue => {
  if (!argText.startsWith('$')) {
    return parseStateValue(argText);
  }

  const varName = argText.slice(1);
  if (loopVariables && varName in loopVariables) {
    return loopVariables[varName];
  }
  if (varName in state) {
    return state[varName];
  }
  if (lists && varName in lists) {
    const listValue = lists[varName];
    if (Array.isArray(listValue) && listValue.length > 0) {
      return listValue[0];
    }
    return listValue;
  }
  return '';
};

export const bindTemplateArguments = (
  parameters: string[],
  callArgs: string[],
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): LoopVariablesMap => {
  const boundParams: LoopVariablesMap = {};

  for (let i = 0; i < parameters.length; i++) {
    const paramName = parameters[i];
    const argText = callArgs[i] || '';
    boundParams[paramName] = resolveArgumentValue(argText, state, loopVariables, lists);
  }

  return boundParams;
};
