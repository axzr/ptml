import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { rowWithCells, rowWithHeaderRole, rowWithFooterRole } from './row.example';
import { render as renderPtml, validate } from '../../index';

describe('Row', () => {
  it('validates table with row and cell children', () => {
    const validation = validate(rowWithCells);
    expect(validation.isValid).toBe(true);
  });

  it('renders table with row as tr and cells as td', () => {
    const node = renderPtml(rowWithCells);
    const { container } = render(<div>{node}</div>);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
    const row = container.querySelector('tr');
    expect(row).toBeInTheDocument();
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(2);
    expect(cells[0]).toHaveTextContent('A1');
    expect(cells[1]).toHaveTextContent('B1');
  });

  it('validates table with row role header', () => {
    const validation = validate(rowWithHeaderRole);
    expect(validation.isValid).toBe(true);
  });

  it('renders header row with th cells', () => {
    const node = renderPtml(rowWithHeaderRole);
    const { container } = render(<div>{node}</div>);
    const headerCells = container.querySelectorAll('th');
    expect(headerCells.length).toBe(2);
    expect(headerCells[0]).toHaveTextContent('Name');
    expect(headerCells[1]).toHaveTextContent('Value');
  });

  it('validates table with header, body, and footer rows', () => {
    const validation = validate(rowWithFooterRole);
    expect(validation.isValid).toBe(true);
  });

  it('renders thead, tbody, tfoot with correct cell types', () => {
    const node = renderPtml(rowWithFooterRole);
    const { container } = render(<div>{node}</div>);
    const thead = container.querySelector('thead');
    expect(thead).toBeInTheDocument();
    const theadCells = thead?.querySelectorAll('th');
    expect(theadCells?.length).toBe(1);
    expect(theadCells?.[0]).toHaveTextContent('H1');

    const tbody = container.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
    const tbodyCells = tbody?.querySelectorAll('td');
    expect(tbodyCells?.length).toBe(1);
    expect(tbodyCells?.[0]).toHaveTextContent('B1');

    const tfoot = container.querySelector('tfoot');
    expect(tfoot).toBeInTheDocument();
    const tfootCells = tfoot?.querySelectorAll('td');
    expect(tfootCells?.length).toBe(1);
    expect(tfootCells?.[0]).toHaveTextContent('F1');
  });
});
