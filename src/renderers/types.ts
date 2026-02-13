import type React from 'react';

import type { Node, FunctionMap, PtmlFilesMap } from '../types';
import type { StateMap, ListMap, LoopVariablesMap } from '../state/state';
import type { TemplateMap } from '../templates/templateOperations';

export type NodeRenderer = (context: RenderContext) => React.ReactNode | null;

export type NamedStylesMap = Record<string, Node>;

export type BreakpointsMap = Record<string, number | undefined>;

export type BreakpointsConfig = {
  map: BreakpointsMap;
  labels: string[];
};

export type TemplateSourceMap = Record<string, string>;

export type DataSourceInfo =
  | { type: 'list'; listName: string; itemIndex: number }
  | { type: 'state'; variableName: string };

export type RenderContext = {
  node: Node;
  keyPrefix?: string;
  namedStyles: NamedStylesMap;
  state: StateMap;
  lists?: ListMap;
  loopVariables?: LoopVariablesMap;
  setState?: (updater: (prevState: StateMap) => StateMap) => void;
  setLists?: (updater: (prevLists: ListMap) => ListMap) => void;
  functionMap?: FunctionMap;
  templateMap?: TemplateMap;
  setError?: (error: string | null) => void;
  nextSibling?: Node;
  viewportWidth?: number;
  breakpoints?: BreakpointsConfig;
  sourceFilename?: string;
  templateSourceMap?: TemplateSourceMap;
  dataSourceInfo?: DataSourceInfo;
  files?: PtmlFilesMap;
};
