import type React from 'react';
import { useMemo } from 'react';

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
  viewportWidth?: number;
  // Host-supplied lists (e.g. app database records) merged in over any
  // same-named list declared in the PTML source. See render()'s comment.
  externalLists?: ListMap;
};

export function usePtmlRender(ptml: string, options?: UsePtmlRenderOptions): RenderResult {
  const files = options?.files;
  const viewportWidth = options?.viewportWidth;
  const externalLists = options?.externalLists;
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
