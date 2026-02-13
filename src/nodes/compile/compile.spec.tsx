import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { validate, parse, render as renderPtml } from '../../index';
import { DataFormatErrors, StateErrors } from '../../errors/messages';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import type { PtmlFilesMap } from '../../types';
import {
  compileBasic,
  compileWithParentState,
  compileEmptySource,
  compileWithStyles,
  compileInvalidSyntax,
  compileMissingVariable,
  compileWithButtonElement,
  compileWithoutDollarPrefix,
  compileWithNoData,
  compileWithFileReference,
  compileWithFileAndImport,
  compileWithMissingFileReference,
} from './compile.example';

describe('Compile Node', () => {
  describe('Validation', () => {
    it('validates a basic compile node', () => {
      const result = validate(compileBasic);
      expect(result.isValid).toBe(true);
    });

    it('validates compile with parent state reference', () => {
      const result = validate(compileWithParentState);
      expect(result.isValid).toBe(true);
    });

    it('validates compile with empty source', () => {
      const result = validate(compileEmptySource);
      expect(result.isValid).toBe(true);
    });

    it('validates compile with styles', () => {
      const result = validate(compileWithStyles);
      expect(result.isValid).toBe(true);
    });

    it('validates compile with missing variable reference', () => {
      const result = validate(compileMissingVariable);
      expect(result.isValid).toBe(true);
    });

    it('rejects compile without a $ variable reference', () => {
      const result = validate(compileWithoutDollarPrefix);
      expectErrorToMatchIgnoringLineNumber(
        result,
        DataFormatErrors.constraintViolation,
        'compile',
        0,
        'data must be a state variable reference starting with $',
      );
    });

    it('rejects compile with no data', () => {
      const result = validate(compileWithNoData);
      expectErrorToMatchIgnoringLineNumber(
        result,
        DataFormatErrors.missingRequiredPart,
        'compile',
        0,
        'state variable',
        'A state variable reference containing PTML source (e.g., $source).',
      );
    });
  });

  describe('Parsing', () => {
    it('parses a compile node with correct type and data', () => {
      const nodes = parse(compileBasic);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      expect(ptmlNode).toBeDefined();
      const compileNode = ptmlNode?.children.find((n) => n.type === 'compile');
      expect(compileNode).toBeDefined();
      expect(compileNode?.data).toBe('$source');
    });

    it('parses compile node category as block', () => {
      const nodes = parse(compileBasic);
      const ptmlNode = nodes.find((n) => n.type === 'ptml');
      const compileNode = ptmlNode?.children.find((n) => n.type === 'compile');
      expect(compileNode?.category).toBe('block');
    });
  });

  describe('Rendering', () => {
    it('renders compiled PTML from state', () => {
      const node = renderPtml(compileBasic);
      render(<div>{node}</div>);
      expect(screen.getByText('Hello from compiled PTML')).toBeInTheDocument();
    });

    it('renders compiled PTML with access to parent state', () => {
      const node = renderPtml(compileWithParentState);
      render(<div>{node}</div>);
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });

    it('renders nothing when source state is empty', () => {
      const node = renderPtml(compileEmptySource);
      const { container } = render(<div>{node}</div>);
      expect(container.textContent).toBe('');
    });

    it('renders nothing when referenced variable does not exist', () => {
      const node = renderPtml(compileMissingVariable);
      const { container } = render(<div>{node}</div>);
      expect(container.textContent).toBe('');
    });

    it('wraps compiled content in a styled div when styles are present', () => {
      const node = renderPtml(compileWithStyles);
      render(<div>{node}</div>);
      const textElement = screen.getByText('Styled compiled content');
      expect(textElement).toBeInTheDocument();
      const wrapper = textElement.closest('div[data-ptml-type="compile"]');
      expect(wrapper).toBeInTheDocument();
    });

    it('displays an error for invalid compiled PTML syntax', () => {
      const node = renderPtml(compileInvalidSyntax);
      render(<div>{node}</div>);
      const errorElement = screen.getByRole('alert');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement.textContent).toContain('[compile error]');
    });

    it('renders compiled PTML containing a button element', () => {
      const node = renderPtml(compileWithButtonElement);
      render(<div>{node}</div>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('file() State Initialization', () => {
    const pageContent = `ptml:\n> text: Hello from file`;
    const stylesContent = `define: page-style\n- color: blue`;

    const filesMap: PtmlFilesMap = {
      'page.ptml': pageContent,
      'styles.ptml': stylesContent,
    };

    it('validates compile with file() reference when file exists', () => {
      const result = validate(compileWithFileReference, filesMap);
      expect(result.isValid).toBe(true);
    });

    it('rejects compile with file() reference when file does not exist', () => {
      const result = validate(compileWithMissingFileReference, filesMap);
      expect(result.isValid).toBe(false);
      expectErrorToMatchIgnoringLineNumber(
        result,
        StateErrors.fileReferenceNotFound,
        'pageSource',
        'nonexistent.ptml',
        0,
      );
    });

    it('renders content from a file-initialized state variable', () => {
      const node = renderPtml(compileWithFileReference, filesMap);
      render(<div>{node}</div>);
      expect(screen.getByText('Hello from file')).toBeInTheDocument();
    });

    it('renders nothing when file reference resolves to empty string', () => {
      const emptyFilesMap: PtmlFilesMap = { 'page.ptml': '' };
      const node = renderPtml(compileWithFileReference, emptyFilesMap);
      const { container } = render(<div>{node}</div>);
      expect(container.textContent).toBe('');
    });

    it('renders compiled content that uses parent imported styles', () => {
      const pageWithStyles = `> text: Styled text\n  - styles: page-style`;
      const importFilesMap: PtmlFilesMap = {
        'page.ptml': pageWithStyles,
        'styles.ptml': stylesContent,
      };
      const node = renderPtml(compileWithFileAndImport, importFilesMap);
      render(<div>{node}</div>);
      expect(screen.getByText('Styled text')).toBeInTheDocument();
    });

    it('shows compile error when file() is not resolved due to missing files map', () => {
      const node = renderPtml(compileWithFileReference);
      render(<div>{node}</div>);
      const errorElement = screen.getByRole('alert');
      expect(errorElement.textContent).toContain('[compile error]');
    });
  });
});
