import type { DataSourceInfo, RenderContext } from './types';
import type { StateMap, LoopVariablesMap } from '../state/state';
import type { Node } from '../types';

type PtmlDataAttributes = {
  'data-ptml-type': string;
  'data-ptml-line': string;
  'data-ptml-style'?: string;
  'data-ptml-file'?: string;
  'data-ptml-data-source'?: string;
};

const VARIABLE_PATTERN = /\$([A-Za-z0-9_.-]+)/g;

const findStateVariableInText = (
  text: string,
  state: StateMap,
  loopVariables: LoopVariablesMap | undefined,
): string | null => {
  VARIABLE_PATTERN.lastIndex = 0;
  let match = VARIABLE_PATTERN.exec(text);
  while (match) {
    const rootName = match[1].split('.')[0];
    const isLoopVar = loopVariables !== undefined && rootName in loopVariables;
    if (!isLoopVar && rootName in state) {
      VARIABLE_PATTERN.lastIndex = 0;
      return rootName;
    }
    match = VARIABLE_PATTERN.exec(text);
  }
  return null;
};

export const detectStateDataSource = (
  node: Node,
  state: StateMap,
  loopVariables: LoopVariablesMap | undefined,
): DataSourceInfo | null => {
  const dataTexts = [node.data, ...node.children.map((c) => c.data)].filter(Boolean);
  for (const text of dataTexts) {
    const variableName = findStateVariableInText(text, state, loopVariables);
    if (variableName) return { type: 'state', variableName };
  }
  return null;
};

const encodeDataSource = (info: DataSourceInfo): string => {
  if (info.type === 'list') return `list:${info.listName}:${info.itemIndex}`;
  return `state:${info.variableName}`;
};

export const buildPtmlDataAttributes = (context: RenderContext): PtmlDataAttributes => {
  const { node, namedStyles, sourceFilename } = context;

  const attributes: PtmlDataAttributes = {
    'data-ptml-type': node.type,
    'data-ptml-line': String(node.lineNumber),
  };

  if (sourceFilename) {
    attributes['data-ptml-file'] = sourceFilename;
  }

  const styleNames = node.children
    .filter((child) => child.type === 'styles' && child.data && namedStyles[child.data])
    .map((child) => child.data);

  if (styleNames.length > 0) {
    attributes['data-ptml-style'] = styleNames.join(',');
  }

  const dataSources: DataSourceInfo[] = [];
  if (context.dataSourceInfo) dataSources.push(context.dataSourceInfo);
  const stateSource = detectStateDataSource(node, context.state, context.loopVariables);
  if (stateSource) dataSources.push(stateSource);

  if (dataSources.length > 0) {
    attributes['data-ptml-data-source'] = dataSources.map(encodeDataSource).join('|');
  }

  return attributes;
};
