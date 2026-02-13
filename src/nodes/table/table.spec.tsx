import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { tableSimple, tableWithHeader, tableWithHeaderBodyFooter } from './table.example';
import { render as renderPtml, validate } from '../../index';

describe('Table', () => {
  it('validates table with row and cell children', () => {
    const validation = validate(tableSimple);
    expect(validation.isValid).toBe(true);
  });

  it('renders table as table element with tbody and tr/td', () => {
    const node = renderPtml(tableSimple);
    const { container } = render(<div>{node}</div>);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(4);
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B2')).toBeInTheDocument();
  });

  it('validates table with header row', () => {
    const validation = validate(tableWithHeader);
    expect(validation.isValid).toBe(true);
  });

  it('renders table with thead and th for header row', () => {
    const node = renderPtml(tableWithHeader);
    const { container } = render(<div>{node}</div>);
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    const headerCells = thead?.querySelectorAll('th');
    expect(headerCells?.length).toBe(2);
    expect(headerCells?.[0]).toHaveTextContent('Col1');
    expect(headerCells?.[1]).toHaveTextContent('Col2');
    const tbody = container.querySelector('tbody');
    expect(tbody?.querySelectorAll('td').length).toBe(2);
  });

  it('validates table with header, body, and footer rows', () => {
    const validation = validate(tableWithHeaderBodyFooter);
    expect(validation.isValid).toBe(true);
  });

  it('renders thead, tbody, tfoot in order', () => {
    const node = renderPtml(tableWithHeaderBodyFooter);
    const { container } = render(<div>{node}</div>);
    const thead = container.querySelector('thead');
    const tbody = container.querySelector('tbody');
    const tfoot = container.querySelector('tfoot');
    expect(thead).toBeInTheDocument();
    expect(thead).toHaveTextContent('H');
    expect(tbody).toBeInTheDocument();
    expect(tbody).toHaveTextContent('B');
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveTextContent('F');
  });
});
