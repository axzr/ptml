import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { initExample } from './init.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Init example (initExample)', () => {
  it('validates initExample', () => {
    const validation = validate(initExample);
    expect(validation.isValid).toBe(true);
  });

  it('parses initExample into correct node structure', () => {
    const nodes = parse(initExample);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const greetingChild = stateNode?.children.find((c) => c.type === 'greeting');
    expect(greetingChild).toBeDefined();
    expect(greetingChild?.data).toBe('yo');

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('setGreeting');

    const setNode = functionNode?.children.find((c) => c.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$greeting Hello, World!');

    const initNode = nodes.find((n) => n.type === 'init');
    expect(initNode).toBeDefined();
    expect(initNode?.data).toBe('');

    const callNode = initNode?.children.find((c) => c.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('setGreeting');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const textNode = boxNode?.children.find((c) => c.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('$greeting');
  });

  it('renders initExample with greeting set by init', async () => {
    const node = renderPtml(initExample);
    render(<div>{node}</div>);

    await waitFor(() => {
      expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    });
  });

  it('executes init node call on render', async () => {
    const node = renderPtml(initExample);
    render(<div>{node}</div>);

    await waitFor(() => {
      const greetingText = screen.queryByText('Hello, World!');
      expect(greetingText).toBeInTheDocument();
    });

    expect(screen.queryByText('yo')).not.toBeInTheDocument();
  });
});
