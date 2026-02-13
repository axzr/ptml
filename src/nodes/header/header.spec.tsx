import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  defaultHeader,
  headerH1,
  headerH2,
  headerWithTextChild,
  headerInvalidLevel,
  headerInvalidLevelFoo,
} from './header.example';
import { render as renderPtml, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ValidatorErrors } from '../../errors/messages';

describe('Header', () => {
  it('validates default header (no data)', () => {
    const validation = validate(defaultHeader);
    expect(validation.isValid).toBe(true);
  });

  it('validates header with h1', () => {
    const validation = validate(headerH1);
    expect(validation.isValid).toBe(true);
  });

  it('validates header with h2', () => {
    const validation = validate(headerH2);
    expect(validation.isValid).toBe(true);
  });

  it('validates header with text child and no level data', () => {
    const validation = validate(headerWithTextChild);
    expect(validation.isValid).toBe(true);
  });

  it('rejects header with invalid level h7', () => {
    const validation = validate(headerInvalidLevel);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.headingLevelInvalid, 'header', 0, 'h7');
  });

  it('rejects header with invalid level foo', () => {
    const validation = validate(headerInvalidLevelFoo);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.headingLevelInvalid, 'header', 0, 'foo');
  });

  it('renders default header as h1 with child text', () => {
    const node = renderPtml(headerWithTextChild);
    render(<div>{node}</div>);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('This is a h1');
  });

  it('renders header: h1 as h1 with child text', () => {
    const node = renderPtml(headerH1);
    render(<div>{node}</div>);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('This is a h1');
  });

  it('renders header: h2 as h2 with child text', () => {
    const node = renderPtml(headerH2);
    render(<div>{node}</div>);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toBeInTheDocument();
    expect(h2).toHaveTextContent('This is a h2');
  });

  it('renders default header (no data) as empty h1 when no children', () => {
    const node = renderPtml(defaultHeader);
    const { container } = render(<div>{node}</div>);
    const h1 = container.querySelector('h1');
    expect(h1).toBeInTheDocument();
    expect(h1?.textContent).toBe('');
  });
});
