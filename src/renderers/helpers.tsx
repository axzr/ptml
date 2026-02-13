import { evaluateCondition } from '../evaluation/conditionals';
import { evaluateBreakpointCondition } from '../evaluation/breakpoints';
import { convertKebabToCamel } from '../utils/regexPatterns';
import { DataFormatErrors } from '../errors/messages';
import { resolveVariable } from '../state/state';
import type { Node } from '../types';
import type { NamedStylesMap, BreakpointsMap, BreakpointsConfig } from './types';
import type { StateMap, LoopVariablesMap } from '../state/state';

export const buildBreakpointsMap = (nodes: Node[]): BreakpointsConfig | undefined => {
  const breakpointsNode = nodes.find((node) => node.type === 'breakpoints');
  if (!breakpointsNode || !breakpointsNode.children.length) {
    return undefined;
  }
  const map: BreakpointsMap = {};
  const labels: string[] = [];
  const children = breakpointsNode.children;
  const lastIndex = children.length - 1;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const label = (child.type ?? '').trim();
    if (!label) continue;
    labels.push(label);
    if (i === lastIndex) {
      map[label] = undefined;
    } else {
      const dataStr = (child.data ?? '').trim();
      const width = dataStr ? parseInt(dataStr, 10) : undefined;
      const value = width !== undefined && !Number.isNaN(width) ? width : undefined;
      map[label] = value;
    }
  }
  return { map, labels };
};

export const buildNamedStylesMap = (nodes: Node[]): NamedStylesMap => {
  const map: NamedStylesMap = {};

  nodes.forEach((node) => {
    if (node.type === 'define') {
      if (!node.data) {
        throw new Error(DataFormatErrors.missingRequiredPart('define', node.lineNumber, 'style name'));
      }
      map[node.data] = node;
    }
  });

  return map;
};

const processStyleProperty = (
  propertyNode: Node,
  style: Record<string, string>,
  state?: StateMap,
  loopVariables?: LoopVariablesMap,
): void => {
  if (!propertyNode.data) {
    return;
  }

  const raw = propertyNode.data.trim();
  const camelCasedProperty = convertKebabToCamel(propertyNode.type);

  if (raw.startsWith('$')) {
    const path = raw.slice(1).trim();
    const resolved = resolveVariable(path, state ?? {}, loopVariables);
    if (resolved === undefined) {
      return;
    }
    style[camelCasedProperty] = resolved;
  } else {
    style[camelCasedProperty] = propertyNode.data;
  }
};

const processConditionalStyles = (
  stylesNode: Node,
  style: Record<string, string>,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
): void => {
  const ifNode = stylesNode.children.find((child) => child.type === 'if');
  const elseNode = stylesNode.children.find((child) => child.type === 'else');

  if (!ifNode || !state) {
    return;
  }

  const condition = ifNode.data || '';
  const isTrue = evaluateCondition(condition, state, loopVariables);
  if (isTrue) {
    ifNode.children.forEach((propertyNode) => {
      processStyleProperty(propertyNode, style, state, loopVariables);
    });
  } else if (elseNode) {
    elseNode.children.forEach((propertyNode) => {
      processStyleProperty(propertyNode, style, state, loopVariables);
    });
  }
};

const resolveNamedStyle = (
  namedStyleNode: Node,
  style: Record<string, string>,
  state?: StateMap,
  loopVariables?: LoopVariablesMap,
  viewportWidth?: number,
  breakpoints?: BreakpointsConfig,
): void => {
  namedStyleNode.children.forEach((child) => {
    if (child.type === 'if' || child.type === 'else') {
      return;
    }
    if (child.type === 'breakpoint') {
      if (
        viewportWidth !== undefined &&
        breakpoints !== undefined &&
        child.data &&
        evaluateBreakpointCondition(viewportWidth, breakpoints, child.data.trim())
      ) {
        child.children.forEach((propertyNode) => {
          processStyleProperty(propertyNode, style, state, loopVariables);
        });
      }
      return;
    }
    processStyleProperty(child, style, state, loopVariables);
  });

  if (state) {
    processConditionalStyles(namedStyleNode, style, state, loopVariables);
  }
};

export const getNodeStyles = (
  node: Node,
  namedStyles: NamedStylesMap,
  state?: StateMap,
  loopVariables?: LoopVariablesMap,
  viewportWidth?: number,
  breakpoints?: BreakpointsConfig,
): Record<string, string> | undefined => {
  const styleNodes = node.children.filter((child) => child.type === 'styles');
  if (styleNodes.length === 0) {
    return undefined;
  }

  const style: Record<string, string> = {};

  styleNodes.forEach((stylesNode) => {
    if (stylesNode.data && namedStyles[stylesNode.data]) {
      const namedStyleNode = namedStyles[stylesNode.data];
      resolveNamedStyle(namedStyleNode, style, state, loopVariables, viewportWidth, breakpoints);
    }

    stylesNode.children.forEach((propertyNode) => {
      if (propertyNode.type === 'if' || propertyNode.type === 'else') {
        return;
      }
      processStyleProperty(propertyNode, style, state, loopVariables);
    });

    if (state) {
      processConditionalStyles(stylesNode, style, state, loopVariables);
    }
  });

  return Object.keys(style).length > 0 ? style : undefined;
};
