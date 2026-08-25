import { describe, it, expect } from 'vitest';
import { render as renderRtl, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { parse, validate, render as renderPtml } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ImportErrors } from '../../errors/messages';
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
  mainImportUnparseableFile,
  filesUnparseable,
  mainImportsTransitively,
  filesTransitiveChain,
  mainNearerDefinitionWins,
  filesNearerAndDeeper,
  mainImportsCycle,
  filesCycle,
  mainImportsMissingNestedFile,
  filesMissingNested,
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
    it('reports an import naming a file that was not supplied', () => {
      const validation = validate(mainImportMissingFile, {});
      expect(validation.isValid).toBe(false);
      // Reported against the import itself, not against whatever used the
      // thing the import was supposed to provide.
      expectErrorToMatchIgnoringLineNumber(
        validation,
        ImportErrors.fileNotFound,
        0,
        'missing.ptml',
        '',
        'No files were supplied alongside this document.',
      );
    });

    it('lists the files that were supplied, so a typo is obvious', () => {
      const validation = validate(mainImportMissingFile, { 'templates.ptml': 'template: x\n> text: x' });
      expect(validation.isValid === false && validation.errorMessage).toContain('Files supplied: templates.ptml');
    });

    it('reports an import naming a file that is not valid PTML', () => {
      const validation = validate(mainImportUnparseableFile, filesUnparseable);
      expect(validation.isValid).toBe(false);
      expect(validation.isValid === false && validation.errorMessage).toContain('is not valid PTML');
      expect(validation.isValid === false && validation.errorMessage).toContain('broken.ptml');
    });

    it('says nothing about imports when no files map is supplied at all', () => {
      // A caller validating a document on its own is not claiming what exists.
      expect(validate(importFooPtml).isValid).toBe(true);
    });

    it('accepts a template declared both here and in an import', () => {
      const result = validate(mainDuplicateTemplateLocalAndImport, filesOtherImportedTemplate);
      expect(result.isValid).toBe(true);
    });

    it('renders the local template when an import declares the same name', () => {
      // Nearer wins. Before 2.0.0 an import overrode the importing file, so a
      // definition in another file could silently capture a local name.
      const node = renderPtml(mainDuplicateTemplateLocalAndImport, filesOtherImportedTemplate);
      expect(node).not.toBeNull();
      renderRtl(<div>{node}</div>);
      expect(screen.getByText('Local template')).toBeInTheDocument();
      expect(screen.queryByText('Imported template')).not.toBeInTheDocument();
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

describe('Transitive imports', () => {
  const textOf = (ptml: string, files: Record<string, string>): string => {
    const { container } = renderRtl(<div>{renderPtml(ptml, files)}</div>);
    return container.textContent ?? '';
  };

  it('reaches a template and a style declared two files away', () => {
    const result = validate(mainImportsTransitively, filesTransitiveChain);
    expect(result.isValid ? true : result.errorMessage).toBe(true);
    expect(textOf(mainImportsTransitively, filesTransitiveChain)).toContain('From two levels down');
  });

  it('applies a named style declared two files away', () => {
    renderRtl(<div>{renderPtml(mainImportsTransitively, filesTransitiveChain)}</div>);
    expect(screen.getByText('styled')).toHaveStyle({ color: 'rgb(102, 51, 153)' });
  });

  it('prefers a nearer definition to a deeper one of the same name', () => {
    expect(textOf(mainNearerDefinitionWins, filesNearerAndDeeper)).toBe('Nearer');
  });

  it('resolves a circular import rather than recursing forever', () => {
    expect(validate(mainImportsCycle, filesCycle).isValid).toBe(true);
    expect(textOf(mainImportsCycle, filesCycle)).toBe('Resolved');
  });

  it('reports a missing import nested inside another file, naming the file it is in', () => {
    const validation = validate(mainImportsMissingNestedFile, filesMissingNested);
    expect(validation.isValid).toBe(false);
    const message = validation.isValid === false ? validation.errorMessage : '';
    expect(message).toContain('gone.ptml');
    expect(message).toContain('of "level-a.ptml"');
  });
});
