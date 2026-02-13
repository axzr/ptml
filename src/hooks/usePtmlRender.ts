import type React from 'react';
import { useMemo } from 'react';

import { validate } from '../validation/validate';
import { render } from '../renderers/render';
import type { PtmlFilesMap } from '../types';

type RenderResult = {
  node: React.ReactNode | null;
  error: string | null;
};

type UsePtmlRenderOptions = {
  files?: PtmlFilesMap;
  viewportWidth?: number;
};

export function usePtmlRender(ptml: string, options?: UsePtmlRenderOptions): RenderResult {
  const files = options?.files;
  const viewportWidth = options?.viewportWidth;
  return useMemo(() => {
    const validation = validate(ptml, files);
    if (!validation.isValid) {
      return {
        node: null,
        error: validation.errorMessage,
      };
    }

    try {
      const node = render(ptml, files, viewportWidth);
      if (node === null) return { node: null, error: null };
      return { node, error: null };
    } catch (error) {
      return {
        node: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }, [ptml, files, viewportWidth]);
}
