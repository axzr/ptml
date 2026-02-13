import { describe, it, expect } from 'vitest';
import { render as renderRtl, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { parse, validate, render as renderPtml } from '../../index';
import {
  importFooPtml,
  importWithPathPtml,
  importWithBackslashPtml,
  importTemplatesPtml,
  mainImportTemplatesShowHome,
  filesTemplatesHomePage,
  filesTemplatesHomeFromImported,
  mainImportStylesPrimary,
  filesStylesPrimary,
  mainImportStylesRedStyle,
  filesStylesRedStyle,
  mainImportMissingFile,
  mainDuplicateTemplateLocalAndImport,
  filesOtherImportedTemplate,
  mainPtmlWithImports,
  mainImportTemplateWithState,
  filesImportTemplateWithState,
  importExampleFiles,
} from './import.example';

describe('Import node', () => {
  describe('Parsing', () => {
    it('parses import: filename.ptml as import node with correct data', () => {
      const nodes = parse(importFooPtml);
      const importNodes = nodes.filter((n) => n.type === 'import');
      expect(importNodes.length).toBe(1);
      expect(importNodes[0].data).toBe('foo.ptml');
      expect(importNodes[0].category).toBe('declaration');
    });

    it('rejects import with path in filename', () => {
      const result = validate(importWithPathPtml);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorMessage).toContain('simple filename');
      }
    });

    it('rejects import with backslash in filename', () => {
      const result = validate(importWithBackslashPtml);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorMessage).toContain('simple filename');
      }
    });

    it('accepts import with valid simple filename', () => {
      const result = validate(importTemplatesPtml);
      expect(result.isValid).toBe(true);
    });
  });

  describe('Validation with files map', () => {
    it('validates template reference when template is in imported file', () => {
      const result = validate(mainImportTemplatesShowHome, filesTemplatesHomePage);
      expect(result.isValid).toBe(true);
    });

    it('fails template reference when template is only in imported file and files not provided', () => {
      const result = validate(mainImportTemplatesShowHome);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorMessage).toContain('does not exist');
      }
    });

    it('validates style reference when define is in imported file', () => {
      const result = validate(mainImportStylesPrimary, filesStylesPrimary);
      expect(result.isValid).toBe(true);
    });

    it('fails style reference when define is only in imported file and files not provided', () => {
      const result = validate(mainImportStylesPrimary);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.errorMessage).toContain('does not exist');
      }
    });
  });

  describe('Rendering with files map', () => {
    it('renders template from imported file when files provided', () => {
      const result = validate(mainImportTemplatesShowHome, filesTemplatesHomeFromImported);
      expect(result.isValid).toBe(true);
      const node = renderPtml(mainImportTemplatesShowHome, filesTemplatesHomeFromImported);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      expect(screen.getByText('Home from imported file')).toBeInTheDocument();
    });

    it('renders named style from imported file when files provided', () => {
      const result = validate(mainImportStylesRedStyle, filesStylesRedStyle);
      expect(result.isValid).toBe(true);
      const node = renderPtml(mainImportStylesRedStyle, filesStylesRedStyle);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      const el = screen.getByText('red text');
      expect(el).toBeInTheDocument();
      expect(el).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    });

    it('does not merge imported templates when files not provided', () => {
      const result = validate(mainImportTemplatesShowHome);
      expect(result.isValid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('missing file in files map leaves template reference unresolved', () => {
      const files: Record<string, string> = {};
      const result = validate(mainImportMissingFile, files);
      expect(result.isValid).toBe(false);
    });

    it('duplicate template name in current file and import both resolve (merge order: imported overwrites)', () => {
      const result = validate(mainDuplicateTemplateLocalAndImport, filesOtherImportedTemplate);
      expect(result.isValid).toBe(true);
    });

    it('duplicate template name renders imported content (import overwrites local)', () => {
      const node = renderPtml(mainDuplicateTemplateLocalAndImport, filesOtherImportedTemplate);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      expect(screen.getByText('Imported template')).toBeInTheDocument();
      expect(screen.queryByText('Local template')).not.toBeInTheDocument();
    });

    it('example mainPtmlWithImports validates and renders with importExampleFiles', () => {
      const result = validate(mainPtmlWithImports, importExampleFiles);
      expect(result.isValid).toBe(true);
      const node = renderPtml(mainPtmlWithImports, importExampleFiles);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      expect(screen.getByText(/Shared header/)).toBeInTheDocument();
      expect(screen.getByText('Welcome')).toBeInTheDocument();
      expect(screen.getByText('Body text with')).toBeInTheDocument();
      expect(screen.getByText(/Shared footer/)).toBeInTheDocument();
    });

    it('example mainPtmlWithImports applies imported named style to body text', () => {
      const node = renderPtml(mainPtmlWithImports, importExampleFiles);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      const bodyText = screen.getByText('Body text with');
      expect(bodyText).toHaveStyle({ color: 'rgb(37, 99, 235)' });
    });

    it('imported template with state and increment button updates count on click', async () => {
      const node = renderPtml(mainImportTemplateWithState, filesImportTemplateWithState);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      expect(screen.getByText('count is 0')).toBeInTheDocument();
      const user = userEvent.setup();
      await user.click(screen.getByRole('button', { name: 'increment' }));
      expect(screen.getByText('count is 1')).toBeInTheDocument();
    });
  });
});
