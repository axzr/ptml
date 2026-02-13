import React from 'react';

import { renderNode } from './renderNode';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import type { RenderContext, TemplateSourceMap } from './types';
import type { BreakpointsConfig } from './types';
import type { Node, FunctionMap, PtmlFilesMap } from '../types';
import type { StateMap } from '../state/state';
import type { TemplateMap } from '../templates/templateOperations';

export const isRenderableNode = (node: Node): boolean => {
  const schema = getSchemaMap().get(node.type);
  return schema ? 'isRenderable' in schema && schema.isRenderable === true : false;
};

const renderOutput = (renderedNodes: React.ReactNode[]): React.ReactNode | null => {
  if (renderedNodes.length === 0) {
    return null;
  }

  if (renderedNodes.length === 1) {
    return renderedNodes[0];
  }

  return <>{renderedNodes.map((node, i) => React.createElement(React.Fragment, { key: `root-${i}` }, node))}</>;
};

type SharedContext = Omit<RenderContext, 'node' | 'keyPrefix' | 'nextSibling'>;

const buildSharedContext = (
  namedStyles: RenderContext['namedStyles'],
  state: StateMap,
  currentLists: RenderContext['lists'],
  setState: RenderContext['setState'],
  setLists: RenderContext['setLists'],
  functionMap: RenderContext['functionMap'],
  templateMap: RenderContext['templateMap'],
  setError: RenderContext['setError'],
  viewportWidth: RenderContext['viewportWidth'],
  breakpoints: RenderContext['breakpoints'],
  sourceFilename: string | undefined,
  templateSourceMap: TemplateSourceMap | undefined,
  files: PtmlFilesMap | undefined,
): SharedContext => ({
  namedStyles,
  state,
  lists: currentLists ?? {},
  setState,
  setLists,
  functionMap,
  templateMap,
  setError,
  viewportWidth,
  breakpoints,
  sourceFilename: sourceFilename ?? 'main',
  templateSourceMap,
  files,
});

export const renderNodesToReact = (
  renderableNodes: Node[],
  namedStyles: RenderContext['namedStyles'],
  state: StateMap,
  currentLists: RenderContext['lists'],
  setState?: RenderContext['setState'],
  setLists?: RenderContext['setLists'],
  functionMap?: FunctionMap,
  templateMap?: TemplateMap,
  setError?: RenderContext['setError'],
  viewportWidth?: number,
  breakpoints?: BreakpointsConfig,
  sourceFilename?: string,
  templateSourceMap?: TemplateSourceMap,
  files?: PtmlFilesMap,
): React.ReactNode | null => {
  const shared = buildSharedContext(
    namedStyles,
    state,
    currentLists,
    setState,
    setLists,
    functionMap,
    templateMap,
    setError,
    viewportWidth,
    breakpoints,
    sourceFilename,
    templateSourceMap,
    files,
  );
  const renderedNodes: React.ReactNode[] = [];

  for (let i = 0; i < renderableNodes.length; i++) {
    const node = renderableNodes[i];
    const nextSibling = i < renderableNodes.length - 1 ? renderableNodes[i + 1] : undefined;
    const rendered = renderNode({ ...shared, node, keyPrefix: String(i), nextSibling });
    if (rendered) renderedNodes.push(rendered);
  }

  return renderOutput(renderedNodes);
};
