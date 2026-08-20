import React from 'react';

import { buildGoogleFontsUrl, parseFontVariants, GOOGLE_FONTS_FILE_ORIGIN } from './googleFonts';
import { FontLoadCheck } from './fontLoadCheck';
import type { FontRequest } from './googleFonts';
import type { RenderContext } from '../../renderers/types';
import type { Node } from '../../types';

export const collectFontRequests = (node: Node): FontRequest[] =>
  node.children
    .filter((child) => child.type === 'font')
    .map((child) => {
      const weightsNode = child.children.find((grandchild) => grandchild.type === 'weights');
      const { weights, italic } = parseFontVariants(weightsNode?.data);
      return { family: (child.data ?? '').trim(), weights, italic };
    })
    .filter((request) => request.family !== '');

export const fontsNodeToReact = (context: RenderContext): React.ReactNode | null => {
  const { node, keyPrefix = '' } = context;
  const requests = collectFontRequests(node);
  const href = buildGoogleFontsUrl(requests);
  if (!href) {
    return null;
  }

  return React.createElement(
    React.Fragment,
    null,
    // Font files come from a different origin to the stylesheet, so warming that
    // connection early is what makes font-display: block a short pause.
    React.createElement('link', {
      key: `${keyPrefix}-preconnect`,
      rel: 'preconnect',
      href: GOOGLE_FONTS_FILE_ORIGIN,
      crossOrigin: 'anonymous',
    }),
    React.createElement('link', { key: `${keyPrefix}-stylesheet`, rel: 'stylesheet', href }),
    React.createElement(FontLoadCheck, {
      key: `${keyPrefix}-check`,
      requests,
      onFontsUnavailable: context.onFontsUnavailable,
    }),
  );
};
