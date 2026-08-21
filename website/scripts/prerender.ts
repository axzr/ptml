import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render as renderPtml, validate } from '../../src/index';
import type { PtmlFilesMap } from '../../src/types';
import { ROUTES } from '../src/routes';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, '..', 'src', 'content');
const DIST_DIR = join(__dirname, '..', 'dist');

const PAGE_FILES = ['styles.ptml', 'home.ptml', 'getting-started.ptml', 'reference.ptml'];

const ROOT_PLACEHOLDER = '<div id="root"></div>';

const readContent = (): { site: string; files: PtmlFilesMap } => {
  const files: PtmlFilesMap = {};
  for (const name of PAGE_FILES) {
    files[name] = readFileSync(join(CONTENT_DIR, name), 'utf8');
  }
  return { site: readFileSync(join(CONTENT_DIR, 'site.ptml'), 'utf8'), files };
};

const renderPage = (site: string, files: PtmlFilesMap, currentPage: string): string => {
  // No viewport width: the browser's real width is unknown at build time, so
  // breakpoints resolve to base styles here. usePtmlRender reports the same on
  // its hydrating render and only then measures, so the two agree.
  const node = renderPtml(site, files, undefined, undefined, undefined, { currentPage });
  if (node === null) {
    throw new Error(`Rendered nothing for page "${currentPage}"`);
  }
  return renderToString(React.createElement(React.Fragment, null, node));
};

const buildDocument = (shell: string, markup: string, title: string): string => {
  if (!shell.includes(ROOT_PLACEHOLDER)) {
    throw new Error(`Built index.html no longer contains ${ROOT_PLACEHOLDER}; prerendering cannot inject markup.`);
  }
  return shell
    .replace(ROOT_PLACEHOLDER, `<div id="root">${markup}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
};

const main = (): void => {
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    throw new Error('website/dist/index.html not found -- run vite build before prerendering.');
  }

  const { site, files } = readContent();
  const validation = validate(site, files);
  if (!validation.isValid) {
    throw new Error(`site.ptml is not valid PTML: ${validation.errorMessage}`);
  }

  const shell = readFileSync(join(DIST_DIR, 'index.html'), 'utf8');

  for (const page of ROUTES) {
    const markup = renderPage(site, files, page.currentPage);
    const outputFile = join(DIST_DIR, page.outputPath);
    mkdirSync(dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, buildDocument(shell, markup, page.title));
    console.log(`Prerendered ${page.outputPath.padEnd(28)} ${String(markup.length).padStart(7)} bytes of markup`);
  }
};

main();
