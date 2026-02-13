import React from 'react';

import type { RenderContext } from '../../renderers/types';
import type { StateValue, StateList, StateMap, LoopVariablesMap } from '../../state/state';

const formatStateValue = (value: StateValue): string => {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const formatState = (state: StateMap): string => {
  const entries = Object.entries(state)
    .map(([key, value]) => `  ${key}: ${formatStateValue(value)}`)
    .join('\n');
  return `{\n${entries}\n}`;
};

const formatLoopVariables = (loopVariables: LoopVariablesMap): string => {
  const entries = Object.entries(loopVariables)
    .map(([key, value]) => `  ${key}: ${formatStateValue(value)}`)
    .join('\n');
  return `{\n${entries}\n}`;
};

const formatListValue = (value: StateValue): string => {
  if (value === null) {
    return 'null';
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
};

const formatLists = (lists: Record<string, StateList>): string => {
  const entries = Object.entries(lists)
    .map(([key, list]) => {
      const items = list.map((item) => `    ${formatListValue(item)}`).join(',\n');
      return `  ${key}: [\n${items}\n  ]`;
    })
    .join('\n');
  return `{\n${entries}\n}`;
};

export const debugNodeToReact = (context: RenderContext): React.ReactNode => {
  const { keyPrefix = '', state, loopVariables, lists } = context;

  const stateOutput = formatState(state);
  const loopVarsOutput =
    loopVariables && Object.keys(loopVariables).length > 0
      ? `\n\nLoop Variables:\n${formatLoopVariables(loopVariables)}`
      : '';
  const listsOutput = lists && Object.keys(lists).length > 0 ? `\n\nLists:\n${formatLists(lists)}` : '';

  const debugContent = `State:\n${stateOutput}${loopVarsOutput}${listsOutput}`;

  const debugStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '12px',
    margin: '8px 0',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxWidth: '100%',
  };

  return React.createElement('pre', { key: keyPrefix, style: debugStyle, 'data-debug': 'true' }, debugContent);
};
