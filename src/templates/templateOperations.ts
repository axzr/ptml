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

// Named arguments are property children on the show node, for example
// "- label: Back in stock soon". Multi-word values work for the same reason "- text:" does --
// the rest of the line is the value -- so no quoting is needed anywhere in the
// language. styles configures the show node itself, not the template.
export const SHOW_OWN_PROPERTIES = new Set(['styles']);

export const parseNamedTemplateArguments = (node: Node): Record<string, string> => {
  const named: Record<string, string> = {};
  node.children.forEach((child) => {
    if (child.category !== 'property' || SHOW_OWN_PROPERTIES.has(child.type)) {
      return;
    }
    named[child.type] = (child.data ?? '').trim();
  });
  return named;
};

export const hasNamedTemplateArguments = (node: Node): boolean =>
  Object.keys(parseNamedTemplateArguments(node)).length > 0;

export const bindNamedTemplateArguments = (
  parameters: string[],
  namedArgs: Record<string, string>,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
): LoopVariablesMap => {
  const boundParams: LoopVariablesMap = {};

  // Parameters with no matching argument stay empty, so a template can treat a
  // parameter as optional.
  parameters.forEach((paramName) => {
    const argText = namedArgs[paramName] ?? '';
    boundParams[paramName] = resolveArgumentValue(argText, state, loopVariables, lists);
  });

  return boundParams;
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
