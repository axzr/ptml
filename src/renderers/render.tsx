import React, { useState } from 'react';

import { buildNamedStylesMap, buildBreakpointsMap } from './helpers';
import { isRenderableNode, renderNodesToReact } from './renderCoordinator';
import { buildStateAndLists } from '../state/state';
import { buildFunctionMap } from '../evaluation/functionOperations';
import { buildTemplateMap } from '../templates/templateOperations';
import { parse } from '../parsers/parser';
import { forEachImportedDocument } from '../imports/importGraph';
import { executeInitNodes } from './initExecutor';
import type { FunctionMap, Node, PtmlFilesMap } from '../types';
import type { StateMap, ListMap } from '../state/state';
import type { TemplateMap } from '../templates/templateOperations';
import type { NamedStylesMap, RenderContext, TemplateSourceMap } from './types';

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
  if (
    node.type === 'textarea' ||
    node.type === 'input' ||
    node.type === 'checkbox' ||
    node.type === 'radio' ||
    node.type === 'select'
  ) {
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
  const state: StateMap = {};
  const lists: ListMap = {};

  forEachImportedDocument(nodes, files, ({ nodes: importedNodes }) => {
    const imported = buildStateAndLists(importedNodes);
    Object.assign(state, imported.state);
    Object.assign(lists, imported.lists);
  });

  // Applied last so this document's own declarations win over anything it imports.
  const local = buildStateAndLists(nodes);
  Object.assign(state, local.state);
  Object.assign(lists, local.lists);

  return { state: resolveFileReferencesInState(state, files), lists };
};

type SharedMaps = {
  templateMap: TemplateMap;
  namedStyles: NamedStylesMap;
  functionMap: FunctionMap;
  templateSourceMap: TemplateSourceMap;
};

const mergeImportsIntoMaps = (nodes: Node[], files: PtmlFilesMap, maps: SharedMaps): void => {
  forEachImportedDocument(nodes, files, ({ filename, nodes: importedNodes }) => {
    const importedTemplates = buildTemplateMap(importedNodes);
    Object.assign(maps.templateMap, importedTemplates);
    Object.assign(maps.namedStyles, buildNamedStylesMap(importedNodes));
    Object.assign(maps.functionMap, buildFunctionMap(importedNodes));
    Object.keys(importedTemplates).forEach((name) => {
      maps.templateSourceMap[name] = filename;
    });
  });
};

const mergeLocalIntoMaps = (nodes: Node[], maps: SharedMaps): void => {
  const localTemplates = buildTemplateMap(nodes);
  Object.assign(maps.templateMap, localTemplates);
  Object.assign(maps.namedStyles, buildNamedStylesMap(nodes));
  Object.assign(maps.functionMap, buildFunctionMap(nodes));
  // A template declared here belongs to this document, whatever an import called
  // the same thing, so it must not keep the imported file as its source.
  Object.keys(localTemplates).forEach((name) => {
    delete maps.templateSourceMap[name];
  });
};

// A breakpoints declaration is one ordered ladder, so unlike templates, styles
// and functions it can't be merged across files. The local declaration wins;
// a file that declares none inherits one wholesale from the first import that
// has one. collectImportedBreakpointLabels in validateSemantics.ts applies the
// same rule, so what validates is what renders.
const buildImportedBreakpoints = (
  nodes: Node[],
  files: PtmlFilesMap,
): ReturnType<typeof buildBreakpointsMap> | undefined => {
  let breakpoints: ReturnType<typeof buildBreakpointsMap> | undefined;
  forEachImportedDocument(nodes, files, ({ nodes: importedNodes }) => {
    const imported = buildBreakpointsMap(importedNodes);
    // Visited deepest first, so a nearer import overwrites a deeper one.
    if (imported) {
      breakpoints = imported;
    }
  });
  return breakpoints;
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
  const maps: SharedMaps = { templateMap: {}, namedStyles: {}, functionMap: {}, templateSourceMap: {} };
  let breakpoints = buildBreakpointsMap(nodes);
  const { lists: builtLists } = buildStateAndLists(nodes);
  const currentLists = lists || builtLists;

  if (files && Object.keys(files).length > 0) {
    mergeImportsIntoMaps(nodes, files, maps);
    if (breakpoints === undefined) {
      breakpoints = buildImportedBreakpoints(nodes, files);
    }
  }
  mergeLocalIntoMaps(nodes, maps);

  const { templateMap, namedStyles, functionMap, templateSourceMap } = maps;
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
  onFontsUnavailable?: RenderContext['onFontsUnavailable'],
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
    onFontsUnavailable,
  );
};

const createInteractiveComponent = (
  ptml: string,
  nodes: Node[],
  initialState: StateMap,
  initialLists: ListMap,
  files?: PtmlFilesMap,
  viewportWidth?: number,
  onFontsUnavailable?: RenderContext['onFontsUnavailable'],
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
        {renderToReact(ptml, state, setState, lists, setLists, setError, files, viewportWidth, onFontsUnavailable)}
      </>
    );
  };

  return React.createElement(InteractiveComponent);
};

export const render = (
  ptml: string,
  files?: PtmlFilesMap,
  viewportWidth?: number,
  externalLists?: ListMap,
  onFontsUnavailable?: RenderContext['onFontsUnavailable'],
  externalState?: StateMap,
): React.ReactNode | null => {
  const nodes = parse(ptml);
  if (nodes.length === 0) {
    return null;
  }

  const { state: initialState, lists: initialLists } =
    files && Object.keys(files).length > 0 ? buildStateAndListsWithImports(nodes, files) : buildStateAndLists(nodes);

  // Lists supplied by the host application (e.g. an app's own database
  // records) take precedence over same-named lists declared in the PTML
  // source itself, but leave every other declared list untouched. An author
  // typically declares an empty `recordList: name` purely to document that a
  // prototype expects a host-supplied list of that name — `each` doesn't
  // actually require the name to be declared at all.
  const lists = externalLists ? { ...initialLists, ...externalLists } : initialLists;

  // Host-supplied state, merged over what the document declares, in the same
  // spirit as externalLists. It exists so a host can seed state it alone knows:
  // the documentation site derives which page to show from the URL, and needs
  // the prerendered HTML and the hydrating client to agree on it.
  const state = externalState ? { ...initialState, ...externalState } : initialState;

  const hasInteractiveElements =
    checkForInteractiveElements(nodes) ||
    (Boolean(files && Object.keys(files).length > 0) && nodes.some((n) => n.type === 'import'));

  if (!hasInteractiveElements) {
    return renderToReact(ptml, state, undefined, lists, undefined, undefined, files, viewportWidth, onFontsUnavailable);
  }

  return createInteractiveComponent(ptml, nodes, state, lists, files, viewportWidth, onFontsUnavailable);
};
