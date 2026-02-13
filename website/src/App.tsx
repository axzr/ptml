import { usePtmlRender } from '@axzr/ptml';
import type { PtmlFilesMap } from '@axzr/ptml';

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
  const { node, error } = usePtmlRender(sitePtml, { files: ptmlFiles });

  if (error) {
    return <pre style={{ color: '#dc2626', padding: '2rem', fontFamily: 'monospace' }}>{error}</pre>;
  }

  return <>{node}</>;
}
