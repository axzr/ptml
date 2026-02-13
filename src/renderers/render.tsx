import React, { useState } from 'react';

import { buildNamedStylesMap, buildBreakpointsMap } from './helpers';
import { isRenderableNode, renderNodesToReact } from './renderCoordinator';
import { buildStateAndLists } from '../state/state';
import { buildFunctionMap } from '../evaluation/functionOperations';
import { buildTemplateMap } from '../templates/templateOperations';
import { parse } from '../parsers/parser';
import { executeInitNodes } from './initExecutor';
import type { FunctionMap, Node, PtmlFilesMap } from '../types';
import type { StateMap, ListMap } from '../state/state';
import type { TemplateMap } from '../templates/templateOperations';
import type { NamedStylesMap, TemplateSourceMap } from './types';

export type RenderContextFromNodes = {
  renderableNodes: Node[];
  namedStyles: ReturnType<typeof buildNamedStylesMap>;
  breakpoints: ReturnType<typeof buildBreakpointsMap>;
  currentLists: ListMap;
  functionMap: ReturnType<typeof buildFunctionMap>;
  templateMap: ReturnType<typeof buildTemplateMap>;
  templateSourceMap: TemplateSourceMap;
};

const hasClickNode = (node: Node): boolean => {
  if (node.type === 'click') {
    return true;
  }
  return node.children.some((child) => hasClickNode(child));
};

const hasFormInputs = (node: Node): boolean => {
  if (node.type === 'textarea' || node.type === 'input' || node.type === 'checkbox' || node.type === 'radio') {
    return true;
  }
  return node.children.some((child) => hasFormInputs(child));
};

const checkForInteractiveElements = (nodes: Node[]): boolean => {
  return nodes.some((node) => hasClickNode(node) || node.type === 'init' || hasFormInputs(node));
};

const FILE_REFERENCE_PATTERN = /^file\((.+)\)$/;

const resolveFileReferencesInState = (state: StateMap, files: PtmlFilesMap): StateMap => {
  const resolved = { ...state };
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === 'string') {
      const match = value.match(FILE_REFERENCE_PATTERN);
      if (match) {
        const filename = match[1].trim();
        resolved[key] = files[filename] ?? '';
      }
    }
  }
  return resolved;
};

const buildStateAndListsWithImports = (nodes: Node[], files: PtmlFilesMap): { state: StateMap; lists: ListMap } => {
  const { state, lists } = buildStateAndLists(nodes);
  const visited = new Set<string>();
  nodes.forEach((node) => {
    if (node.type !== 'import' || !node.data) return;
    const filename = node.data.trim();
    if (visited.has(filename)) return;
    visited.add(filename);
    const content = files[filename];
    if (!content || typeof content !== 'string') return;
    try {
      const importedNodes = parse(content);
      const { state: importedState, lists: importedLists } = buildStateAndLists(importedNodes);
      Object.assign(state, importedState);
      Object.assign(lists, importedLists);
    } catch {
      // ignore parse errors in imported file
    }
  });
  const resolvedState = resolveFileReferencesInState(state, files);
  return { state: resolvedState, lists };
};

const mergeImportsIntoMaps = (
  nodes: Node[],
  files: PtmlFilesMap,
  templateMap: TemplateMap,
  namedStyles: NamedStylesMap,
  functionMap: FunctionMap,
  visited: Set<string>,
  templateSourceMap: TemplateSourceMap,
): void => {
  nodes.forEach((node) => {
    if (node.type !== 'import' || !node.data) return;
    const filename = node.data.trim();
    if (visited.has(filename)) return;
    visited.add(filename);
    const content = files[filename];
    if (!content || typeof content !== 'string') return;
    try {
      const importedNodes = parse(content);
      const importedTemplates = buildTemplateMap(importedNodes);
      const importedStyles = buildNamedStylesMap(importedNodes);
      const importedFunctionMap = buildFunctionMap(importedNodes);
      Object.assign(templateMap, importedTemplates);
      Object.assign(namedStyles, importedStyles);
      Object.assign(functionMap, importedFunctionMap);
      Object.keys(importedTemplates).forEach((name) => {
        templateSourceMap[name] = filename;
      });
    } catch {
      // ignore parse errors in imported file
    }
  });
};

export const buildRenderContextFromNodes = (
  nodes: Node[],
  lists?: ListMap,
  files?: PtmlFilesMap,
): RenderContextFromNodes | null => {
  const renderableNodes = nodes.filter(isRenderableNode);
  if (renderableNodes.length === 0) {
    return null;
  }
  const namedStyles = buildNamedStylesMap(nodes);
  const breakpoints = buildBreakpointsMap(nodes);
  const { lists: builtLists } = buildStateAndLists(nodes);
  const currentLists = lists || builtLists;
  const functionMap = buildFunctionMap(nodes);
  const templateMap = buildTemplateMap(nodes);
  const templateSourceMap: TemplateSourceMap = {};
  if (files && Object.keys(files).length > 0) {
    const visited = new Set<string>();
    mergeImportsIntoMaps(nodes, files, templateMap, namedStyles, functionMap, visited, templateSourceMap);
  }
  return { renderableNodes, namedStyles, breakpoints, currentLists, functionMap, templateMap, templateSourceMap };
};

const renderToReact = (
  ptml: string,
  state: StateMap,
  setState?: (updater: (prevState: StateMap) => StateMap) => void,
  lists?: ListMap,
  setLists?: (updater: (prevLists: ListMap) => ListMap) => void,
  setError?: (error: string | null) => void,
  files?: PtmlFilesMap,
  viewportWidth?: number,
): React.ReactNode | null => {
  const nodes = parse(ptml);
  if (nodes.length === 0) {
    return null;
  }
  const context = buildRenderContextFromNodes(nodes, lists, files);
  if (!context) {
    return null;
  }
  return renderNodesToReact(
    context.renderableNodes,
    context.namedStyles,
    state,
    context.currentLists,
    setState,
    setLists,
    context.functionMap,
    context.templateMap,
    setError,
    viewportWidth,
    context.breakpoints,
    undefined,
    context.templateSourceMap,
    files,
  );
};

const createInteractiveComponent = (
  ptml: string,
  nodes: Node[],
  initialState: StateMap,
  initialLists: ListMap,
  files?: PtmlFilesMap,
  viewportWidth?: number,
): React.ReactNode => {
  const functionMap = buildFunctionMap(nodes);
  const initNodes = nodes.filter((node) => node.type === 'init');

  const {
    state: initState,
    lists: initLists,
    error: initError,
  } = initNodes.length > 0
    ? executeInitNodes(initNodes, initialState, initialLists, functionMap)
    : { state: initialState, lists: initialLists, error: null };

  const InteractiveComponent: React.FC = () => {
    const [state, setState] = useState<StateMap>(initState);
    const [lists, setLists] = useState<ListMap>(initLists);
    const [error, setError] = useState<string | null>(initError);

    return (
      <>
        {error ? (
          <div role="alert" className="text-red-600 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="font-bold mb-2">PTML Runtime Error:</div>
            <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
          </div>
        ) : null}
        {renderToReact(ptml, state, setState, lists, setLists, setError, files, viewportWidth)}
      </>
    );
  };

  return React.createElement(InteractiveComponent);
};

export const render = (ptml: string, files?: PtmlFilesMap, viewportWidth?: number): React.ReactNode | null => {
  const nodes = parse(ptml);
  if (nodes.length === 0) {
    return null;
  }

  const { state: initialState, lists: initialLists } =
    files && Object.keys(files).length > 0 ? buildStateAndListsWithImports(nodes, files) : buildStateAndLists(nodes);

  const hasInteractiveElements =
    checkForInteractiveElements(nodes) ||
    (Boolean(files && Object.keys(files).length > 0) && nodes.some((n) => n.type === 'import'));

  if (!hasInteractiveElements) {
    return renderToReact(ptml, initialState, undefined, initialLists, undefined, undefined, files, viewportWidth);
  }

  return createInteractiveComponent(ptml, nodes, initialState, initialLists, files, viewportWidth);
};
