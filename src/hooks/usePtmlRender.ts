import type React from 'react';
import { useMemo, useSyncExternalStore } from 'react';

import { validate } from '../validation/validate';
import { render } from '../renderers/render';
import type { PtmlFilesMap } from '../types';
import type { ListMap } from '../state/state';

type RenderResult = {
  node: React.ReactNode | null;
  error: string | null;
};

type UsePtmlRenderOptions = {
  files?: PtmlFilesMap;
  // Width, in pixels, that breakpoint blocks and breakpoint styles are resolved
  // against. Omit it and the live browser window width is used, kept current as
  // the window resizes. Supply it only to render at a width other than the real
  // window -- a device-frame preview, say. Breakpoints are resolved here rather
  // than by CSS media queries, so with neither a supplied width nor a window
  // (server rendering) no breakpoint applies and only base styles render.
  viewportWidth?: number;
  // Host-supplied lists (e.g. app database records) merged in over any
  // same-named list declared in the PTML source. See render()'s comment.
  externalLists?: ListMap;
};

const subscribeToViewportWidth = (onStoreChange: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener('resize', onStoreChange);
  return () => window.removeEventListener('resize', onStoreChange);
};

const getViewportWidth = (): number | undefined => (typeof window === 'undefined' ? undefined : window.innerWidth);

// No window width exists during server rendering, so breakpoints resolve to
// base styles there and settle on the real width once the client takes over.
const getServerViewportWidth = (): number | undefined => undefined;

export function usePtmlRender(ptml: string, options?: UsePtmlRenderOptions): RenderResult {
  const files = options?.files;
  const externalLists = options?.externalLists;
  const measuredViewportWidth = useSyncExternalStore(
    subscribeToViewportWidth,
    getViewportWidth,
    getServerViewportWidth,
  );
  const viewportWidth = options?.viewportWidth ?? measuredViewportWidth;
  return useMemo(() => {
    const validation = validate(ptml, files);
    if (!validation.isValid) {
      return {
        node: null,
        error: validation.errorMessage,
      };
    }

    try {
      const node = render(ptml, files, viewportWidth, externalLists);
      if (node === null) return { node: null, error: null };
      return { node, error: null };
    } catch (error) {
      return {
        node: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [ptml, files, viewportWidth, externalLists]);
}
