import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { listUnordered, listOrdered, listLowerAlpha } from './list.example';
import { render as renderPtml, validate } from '../../index';

describe('List', () => {
  it('validates unordered list with listItem children', () => {
    const validation = validate(listUnordered);
    expect(validation.isValid).toBe(true);
  });

  it('renders unordered list as ul with list items', () => {
    const node = renderPtml(listUnordered);
    render(<div>{node}</div>);
    const ul = screen.getByRole('list');
    expect(ul).toBeInTheDocument();
    expect(ul.tagName).toBe('UL');
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('validates ordered list with type property', () => {
    const validation = validate(listOrdered);
    expect(validation.isValid).toBe(true);
  });

  it('renders ordered list as ol with list items', () => {
    const node = renderPtml(listOrdered);
    render(<div>{node}</div>);
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe('OL');
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('validates list with type lower-alpha', () => {
    const validation = validate(listLowerAlpha);
    expect(validation.isValid).toBe(true);
  });

  it('renders list with type lower-alpha as ol with listStyleType', () => {
    const node = renderPtml(listLowerAlpha);
    const { container } = render(<div>{node}</div>);
    const ol = container.querySelector('ol');
    expect(ol).toBeInTheDocument();
    expect(ol).toHaveStyle({ listStyleType: 'lower-alpha' });
    expect(screen.getByText('Alpha item')).toBeInTheDocument();
    expect(screen.getByText('Beta item')).toBeInTheDocument();
  });
});
