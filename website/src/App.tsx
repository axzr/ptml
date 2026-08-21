import { useMemo } from 'react';
import { usePtmlRender } from 'ptml';
import type { PtmlFilesMap } from 'ptml';

import { pageFromPath } from './routes';

import sitePtml from './content/site.ptml?raw';
import stylesPtml from './content/styles.ptml?raw';
import homePtml from './content/home.ptml?raw';
import gettingStartedPtml from './content/getting-started.ptml?raw';
import referencePtml from './content/reference.ptml?raw';

const ptmlFiles: PtmlFilesMap = {
  'styles.ptml': stylesPtml,
  'home.ptml': homePtml,
  'getting-started.ptml': gettingStartedPtml,
  'reference.ptml': referencePtml,
};

export function App() {
  const externalState = useMemo(
    () => ({ currentPage: pageFromPath(typeof window === 'undefined' ? '/' : window.location.pathname) }),
    [],
  );
  const { node, error } = usePtmlRender(sitePtml, { files: ptmlFiles, externalState });

  if (error) {
    return <pre style={{ color: '#dc2626', padding: '2rem', fontFamily: 'monospace' }}>{error}</pre>;
  }

  return <>{node}</>;
}
