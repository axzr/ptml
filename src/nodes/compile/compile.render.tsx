import React from 'react';

import { parse } from '../../parsers/parser';
import { buildRenderContextFromNodes } from '../../renderers/render';
import { renderNodesToReact } from '../../renderers/renderCoordinator';
import { getNodeStyles } from '../../renderers/helpers';
import { resolveVariable } from '../../state/state';
import type { RenderContext } from '../../renderers/types';
import type { RenderContextFromNodes } from '../../renderers/render';
import type { Node } from '../../types';

const MAX_COMPILE_DEPTH = 3;
let compileDepth = 0;

const wrapSourceIfNeeded = (source: string): string => {
  const trimmed = source.trim();
  if (!trimmed) {
    return source;
  }
  const firstLine = trimmed.split('\n')[0];
  const startsWithPrefix = /^[>?!-]/.test(firstLine);
  if (startsWithPrefix) {
    const indentedLines = trimmed
      .split('\n')
      .map((line) => (line.trim() ? line : line))
      .join('\n');
    return `ptml:\n${indentedLines}`;
  }
  return source;
};

const renderCompileError = (message: string, keyPrefix: string): React.ReactNode =>
  React.createElement(
    'div',
    {
      key: keyPrefix,
      role: 'alert',
      style: { color: '#dc2626', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.875rem' },
    },
    `[compile error] ${message}`,
  );

const renderCompiledNodes = (compiled: RenderContextFromNodes, context: RenderContext): React.ReactNode | null => {
  const mergedNamedStyles = { ...context.namedStyles, ...compiled.namedStyles };
  const mergedFunctionMap = { ...context.functionMap, ...compiled.functionMap };
  const mergedTemplateMap = { ...context.templateMap, ...compiled.templateMap };
  const mergedLists = { ...context.lists, ...compiled.currentLists };

  return renderNodesToReact(
    compiled.renderableNodes,
    mergedNamedStyles,
    context.state,
    mergedLists,
    context.setState,
    context.setLists,
    mergedFunctionMap,
    mergedTemplateMap,
    context.setError,
    context.viewportWidth,
    compiled.breakpoints ?? context.breakpoints,
    context.sourceFilename,
    context.templateSourceMap,
    context.files,
  );
};

const wrapWithStyles = (rendered: React.ReactNode, node: Node, context: RenderContext): React.ReactNode => {
  const styleChildren = node.children.filter((child) => child.type === 'styles');
  if (styleChildren.length === 0) {
    return rendered;
  }

  const nodeWithStyles = { ...node, children: styleChildren };
  const style = getNodeStyles(
    nodeWithStyles as Node,
    context.namedStyles,
    context.state,
    context.loopVariables,
    context.viewportWidth,
    context.breakpoints,
  );
  return React.createElement('div', { key: context.keyPrefix, style }, rendered);
};

const resolveSourceFromState = (context: RenderContext): { ptmlSource: string; variableReference: string } | null => {
  const variableReference = (context.node.data || '').trim();
  if (!variableReference.startsWith('$')) {
    return null;
  }

  const variablePath = variableReference.slice(1);
  const ptmlSource = resolveVariable(variablePath, context.state, context.loopVariables);

  if (ptmlSource === undefined || ptmlSource === '') {
    return null;
  }

  return { ptmlSource, variableReference };
};

export const compileNodeToReact = (context: RenderContext): React.ReactNode | null => {
  const { keyPrefix = '' } = context;

  const resolved = resolveSourceFromState(context);
  if (!resolved) {
    const variableRef = (context.node.data || '').trim();
    if (!variableRef.startsWith('$')) {
      return renderCompileError('data must be a state variable reference starting with $', keyPrefix);
    }
    return null;
  }

  if (compileDepth >= MAX_COMPILE_DEPTH) {
    return renderCompileError(`maximum compile depth of ${MAX_COMPILE_DEPTH} exceeded`, keyPrefix);
  }

  compileDepth++;
  try {
    const wrappedSource = wrapSourceIfNeeded(resolved.ptmlSource);
    const parsedNodes = parse(wrappedSource);
    if (parsedNodes.length === 0) {
      return null;
    }

    const compiled = buildRenderContextFromNodes(parsedNodes, undefined, context.files);
    if (!compiled) {
      return null;
    }

    const rendered = renderCompiledNodes(compiled, context);
    return wrapWithStyles(rendered, context.node, context);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return renderCompileError(message, keyPrefix);
  } finally {
    compileDepth--;
  }
};
