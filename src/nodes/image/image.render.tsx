import React from 'react';

import { getNodeStyles } from '../../renderers/helpers';
import { resolveVariable } from '../../state/state';
import type { RenderContext } from '../../renderers/types';

const getResolvedAttributeValue = (
  data: string,
  state: RenderContext['state'],
  loopVariables?: RenderContext['loopVariables'],
): string => {
  if (!data) {
    return '';
  }
  const raw = data.trim();
  if (raw.startsWith('$')) {
    const path = raw.slice(1).trim();
    const resolved = resolveVariable(path, state, loopVariables);
    return resolved !== undefined ? String(resolved) : '';
  }
  return raw;
};

export const imageNodeToReact = (context: RenderContext): React.ReactNode => {
  const { node, keyPrefix = '', namedStyles, state, loopVariables } = context;
  const style = getNodeStyles(node, namedStyles, state, loopVariables, context.viewportWidth, context.breakpoints);

  const srcNode = node.children.find((child) => child.type === 'src');
  const srcData = srcNode?.data?.trim() || '';
  const src = getResolvedAttributeValue(srcData, state, loopVariables);

  const altNode = node.children.find((child) => child.type === 'alt');
  const altData = altNode?.data?.trim() || '';
  const alt = getResolvedAttributeValue(altData, state, loopVariables);

  return React.createElement('img', {
    key: keyPrefix,
    src,
    alt: alt || undefined,
    style: style as React.CSSProperties | undefined,
  });
};
