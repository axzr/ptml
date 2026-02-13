import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { textWithPipe, textWithPipes } from './text.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Text with pipe expression (textWithPipe)', () => {
  it('validates textWithPipe', () => {
    const validation = validate(textWithPipe);
    expect(validation.isValid).toBe(true);
  });

  it('parses textWithPipe into state and text nodes', () => {
    const nodes = parse(textWithPipe);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const countChild = stateNode?.children.find((c) => c.type === 'count');
    expect(countChild).toBeDefined();
    expect(countChild?.data).toBe('0');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const textNode = boxNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('Hello, ($count 1 | add)!');
  });

  it('renders textWithPipe with evaluated expression', () => {
    const node = renderPtml(textWithPipe);
    render(<div>{node}</div>);

    expect(screen.getByText('Hello, 1!')).toBeInTheDocument();
  });
});

describe('Text with multiple pipe expressions (textWithPipes)', () => {
  it('validates textWithPipes', () => {
    const validation = validate(textWithPipes);
    expect(validation.isValid).toBe(true);
  });

  it('parses textWithPipes into text node with multiple expressions', () => {
    const nodes = parse(textWithPipes);
    expect(nodes.length).toBeGreaterThan(0);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const textNode = boxNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('Hello, ($count 1 | add) | ($count 1 | add)!');
  });

  it('renders textWithPipes with all expressions evaluated', () => {
    const node = renderPtml(textWithPipes);
    render(<div>{node}</div>);

    expect(screen.getByText('Hello, 1 | 1!')).toBeInTheDocument();
  });
});
