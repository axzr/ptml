import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { textWithPipe, textWithPipes, textWithNewline } from './text.example';
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

describe('Text with newline property (textWithNewline)', () => {
  it('validates textWithNewline', () => {
    const validation = validate(textWithNewline);
    expect(validation.isValid).toBe(true);
  });

  it('parses textWithNewline with newline child node', () => {
    const nodes = parse(textWithNewline);
    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    const textNodes = boxNode?.children.filter((child) => child.type === 'text');
    expect(textNodes).toHaveLength(2);

    const firstText = textNodes![0];
    const newlineNode = firstText.children.find((child) => child.type === 'newline');
    expect(newlineNode).toBeDefined();

    const secondText = textNodes![1];
    const noNewline = secondText.children.find((child) => child.type === 'newline');
    expect(noNewline).toBeUndefined();
  });

  it('renders a <br> after text when newline is present', () => {
    const node = renderPtml(textWithNewline);
    const { container } = render(<div>{node}</div>);

    const brElements = container.querySelectorAll('br');
    expect(brElements).toHaveLength(1);
  });

  it('does not render <br> when newline is absent', () => {
    const noNewlinePtml = `
ptml:
> box:
  > text: Hello
  > text: World
`;
    const node = renderPtml(noNewlinePtml);
    const { container } = render(<div>{node}</div>);

    const brElements = container.querySelectorAll('br');
    expect(brElements).toHaveLength(0);
  });
});
