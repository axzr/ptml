import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render as renderPtml, usePtmlRender } from 'ptml';
import type { PtmlFilesMap } from 'ptml';
import { ROUTES, pageFromPath } from './routes';

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), 'content');

const files: PtmlFilesMap = {};
for (const name of ['styles.ptml', 'home.ptml', 'getting-started.ptml', 'reference.ptml']) {
  files[name] = readFileSync(join(CONTENT_DIR, name), 'utf8');
}
const site = readFileSync(join(CONTENT_DIR, 'site.ptml'), 'utf8');

// Something only that page shows, to prove the right one was rendered.
const MARKERS: Record<string, string> = {
  home: 'For developers who prototype',
  'getting-started': 'Installation',
  reference: 'Language Reference',
};

const serverHtml = (currentPage: string): string =>
  renderToString(
    React.createElement(
      React.Fragment,
      null,
      renderPtml(site, files, undefined, undefined, undefined, { currentPage }),
    ),
  );

describe('route table', () => {
  it('maps every route path to its page, with and without a trailing slash', () => {
    for (const route of ROUTES) {
      expect(pageFromPath(route.path)).toBe(route.currentPage);
      expect(pageFromPath(`${route.path}/`)).toBe(route.currentPage);
    }
  });

  it('falls back to the first route for an unknown path', () => {
    expect(pageFromPath('/nonsense')).toBe(ROUTES[0].currentPage);
  });

  it('links every route from the nav, so each prerendered page is reachable', () => {
    for (const route of ROUTES) {
      // Trailing slash in the href keeps GitHub Pages from redirecting.
      expect(site).toContain(`- href: ${route.path === '/' ? '/' : `${route.path}/`}`);
      expect(site).toContain(`! set: $currentPage ${route.currentPage}`);
    }
  });
});

describe('prerendered pages', () => {
  it.each(ROUTES.map((route) => [route.currentPage] as const))(
    'renders %s to static HTML at build time',
    (currentPage) => {
      const html = serverHtml(currentPage);
      expect(html).toContain(MARKERS[currentPage]);
      // The nav must be in the static HTML too, or nothing links the pages.
      expect(html).toContain('href="/reference/"');
    },
  );

  // A cold load must hydrate into the page it was prerendered as. Getting this
  // wrong shows the right page, then silently replaces it with the home page.
  it.each(ROUTES.map((route) => [route.currentPage] as const))(
    'hydrates a cold load of %s without mismatch',
    (currentPage) => {
      const container = document.createElement('div');
      container.innerHTML = serverHtml(currentPage);
      document.body.appendChild(container);

      const mismatches: string[] = [];
      const consoleError = vi.spyOn(console, 'error').mockImplementation((...args) => {
        const message = String(args[0]);
        if (!message.includes('not configured to support act')) mismatches.push(message);
      });

      const App = () => {
        const { node } = usePtmlRender(site, { files, externalState: { currentPage } });
        return React.createElement(React.Fragment, null, node);
      };
      act(() => {
        hydrateRoot(container, React.createElement(App));
      });

      expect(mismatches).toEqual([]);
      expect(container.textContent).toContain(MARKERS[currentPage]);

      consoleError.mockRestore();
      document.body.removeChild(container);
    },
  );
});
