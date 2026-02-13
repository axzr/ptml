import React from 'react';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { buildPtmlDataAttributes } from './ptmlDataAttributes';
import type { RenderContext } from './types';

export const renderNode = (context: RenderContext): React.ReactNode | null => {
  const { node } = context;
  const schema = getSchemaMap().get(node.type);
  const renderer = schema?.functions?.render;
  if (renderer) {
    const rendered = renderer(context);
    if (rendered && React.isValidElement(rendered) && node.category === 'block') {
      return React.cloneElement(rendered, buildPtmlDataAttributes(context));
    }
    return rendered;
  }

  return null;
};
