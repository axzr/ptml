import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { listItemWithText, listItemWithTwoTexts } from './listItem.example';
import { render as renderPtml, validate } from '../../index';

describe('ListItem', () => {
  it('validates listItem with text child', () => {
    const validation = validate(listItemWithText);
    expect(validation.isValid).toBe(true);
  });

  it('renders listItem as li with child text', () => {
    const node = renderPtml(listItemWithText);
    render(<div>{node}</div>);
    const li = screen.getByRole('listitem');
    expect(li).toBeInTheDocument();
    expect(li).toHaveTextContent('One');
  });

  it('validates listItem with two text children', () => {
    const validation = validate(listItemWithTwoTexts);
    expect(validation.isValid).toBe(true);
  });

  it('renders listItem with two text children', () => {
    const node = renderPtml(listItemWithTwoTexts);
    const { container } = render(<div>{node}</div>);
    const li = container.querySelector('li');
    expect(li).toBeInTheDocument();
    expect(container.textContent).toContain('First');
    expect(container.textContent).toContain('Second');
  });
});
