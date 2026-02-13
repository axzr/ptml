import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { cellWithText, cellWithBox } from './cell.example';
import { render as renderPtml, validate } from '../../index';

describe('Cell', () => {
  it('validates table with row and cell children', () => {
    const validation = validate(cellWithText);
    expect(validation.isValid).toBe(true);
  });

  it('renders table with row and cells as tr and td elements', () => {
    const node = renderPtml(cellWithText);
    const { container } = render(<div>{node}</div>);
    const row = container.querySelector('tr');
    expect(row).toBeInTheDocument();
    const cells = container.querySelectorAll('td');
    expect(cells.length).toBe(2);
    expect(cells[0]).toHaveTextContent('A1');
    expect(cells[1]).toHaveTextContent('B1');
  });

  it('validates table with row and cell containing box', () => {
    const validation = validate(cellWithBox);
    expect(validation.isValid).toBe(true);
  });

  it('renders cell with box child', () => {
    const node = renderPtml(cellWithBox);
    const { container } = render(<div>{node}</div>);
    expect(container.querySelector('td')).toHaveTextContent('Content');
  });
});
