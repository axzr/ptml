import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { debugSimpleState, debugComplexState, debugList, debugWithChild } from './debug.example';
import { render as renderPtml, validate, parse } from '../../index';
import { ChildrenErrors } from '../../errors/messages';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';

describe('Debug node (debugSimpleState)', () => {
  it('validates debugSimpleState', () => {
    const validation = validate(debugSimpleState);
    expect(validation.isValid).toBe(true);
  });

  it('parses debugSimpleState into state and debug nodes', () => {
    const nodes = parse(debugSimpleState);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const countChild = stateNode?.children.find((c) => c.type === 'count');
    expect(countChild).toBeDefined();
    expect(countChild?.data).toBe('0');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const debugNode = ptmlNode?.children.find((n) => n.type === 'debug');
    expect(debugNode).toBeDefined();
  });

  it('renders debugSimpleState with debug output', () => {
    const node = renderPtml(debugSimpleState);
    render(<div>{node}</div>);

    const debugOutput = screen.getByText(/count/i);
    expect(debugOutput).toBeInTheDocument();
  });

  it('displays state values in debug output', () => {
    const node = renderPtml(debugSimpleState);
    render(<div>{node}</div>);

    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('renders debug node in a styled container', () => {
    const node = renderPtml(debugSimpleState);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]') || container.querySelector('.debug');
    expect(debugElement).toBeInTheDocument();
  });
});

describe('Debug node (debugComplexState)', () => {
  it('validates debugComplexState', () => {
    const validation = validate(debugComplexState);
    expect(validation.isValid).toBe(true);
  });

  it('parses debugComplexState into multiple state nodes and debug node', () => {
    const nodes = parse(debugComplexState);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNodes = nodes.filter((n) => n.type === 'state');
    expect(stateNodes.length).toBeGreaterThanOrEqual(3);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const debugNode = ptmlNode?.children.find((n) => n.type === 'debug');
    expect(debugNode).toBeDefined();
  });

  it('renders debugComplexState with all state values', () => {
    const node = renderPtml(debugComplexState);
    render(<div>{node}</div>);

    const debugOutput = screen.getByText(/count/i);
    expect(debugOutput).toBeInTheDocument();
  });

  it('displays simple scalar state values in debug output', () => {
    const node = renderPtml(debugComplexState);
    render(<div>{node}</div>);

    expect(screen.getByText(/count.*0/i)).toBeInTheDocument();
  });

  it('displays object state properties in debug output', () => {
    const node = renderPtml(debugComplexState);
    render(<div>{node}</div>);

    const debugContent = screen.getByText(/name/i)?.textContent || '';
    expect(debugContent).toMatch(/Bob/i);
    expect(debugContent).toMatch(/30/i);
    expect(debugContent).toMatch(/New York/i);
  });

  it('displays inline object state values in debug output', () => {
    const node = renderPtml(debugComplexState);
    render(<div>{node}</div>);

    const debugContent = screen.getByText(/products/i)?.textContent || '';
    expect(debugContent).toMatch(/Product 1/i);
    expect(debugContent).toMatch(/29\.99/i);
  });

  it('formats complex state objects with proper indentation', () => {
    const node = renderPtml(debugComplexState);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    expect(debugElement).toBeInTheDocument();
    const content = debugElement?.textContent || '';
    expect(content).toContain('State:');
    expect(content).toContain('count');
  });
});

describe('Debug node (debugList)', () => {
  it('validates debugList', () => {
    const validation = validate(debugList);
    expect(validation.isValid).toBe(true);
  });

  it('parses debugList into list and debug nodes', () => {
    const nodes = parse(debugList);
    expect(nodes.length).toBeGreaterThan(0);

    const listNode = nodes.find((n) => n.type === 'valueList' && n.data === 'items');
    expect(listNode).toBeDefined();
    expect(listNode?.children).toHaveLength(3);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const debugNode = ptmlNode?.children.find((n) => n.type === 'debug');
    expect(debugNode).toBeDefined();
  });

  it('displays lists section in debug output', () => {
    const node = renderPtml(debugList);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    expect(debugElement).toBeInTheDocument();
    const content = debugElement?.textContent || '';
    expect(content).toContain('Lists:');
    expect(content).toContain('items');
  });

  it('displays all list items with their full text in debug output', () => {
    const node = renderPtml(debugList);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    const content = debugElement?.textContent || '';
    expect(content).toContain('item 1');
    expect(content).toContain('item 2');
    expect(content).toContain('item 3');
  });

  it('formats list items as an array with proper structure and full item text', () => {
    const node = renderPtml(debugList);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    const content = debugElement?.textContent || '';
    expect(content).toContain('items:');
    expect(content).toMatch(/items:\s*\[/);
    expect(content).toContain('item 1');
    expect(content).toContain('item 2');
    expect(content).toContain('item 3');
    expect(content).toMatch(/\]/);
  });

  it('displays list items in correct order with full text', () => {
    const node = renderPtml(debugList);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    const content = debugElement?.textContent || '';
    const itemsIndex = content.indexOf('items:');
    const item1Index = content.indexOf('item 1', itemsIndex);
    const item2Index = content.indexOf('item 2', itemsIndex);
    const item3Index = content.indexOf('item 3', itemsIndex);

    expect(item1Index).toBeGreaterThan(-1);
    expect(item2Index).toBeGreaterThan(item1Index);
    expect(item3Index).toBeGreaterThan(item2Index);
  });

  it('displays exactly three list items with their complete text values', () => {
    const node = renderPtml(debugList);
    const { container } = render(<div>{node}</div>);

    const debugElement = container.querySelector('[data-debug]');
    const content = debugElement?.textContent || '';
    const itemsMatch = content.match(/items:\s*\[([^\]]+)\]/);
    expect(itemsMatch).toBeTruthy();
    const itemsContent = itemsMatch?.[1] || '';
    expect(itemsContent).toContain('item 1');
    expect(itemsContent).toContain('item 2');
    expect(itemsContent).toContain('item 3');
    const itemMatches = itemsContent.match(/item \d+/g) || [];
    expect(itemMatches).toHaveLength(3);
  });
});

describe('Debug node (debugWithChild)', () => {
  it('validates debugWithChild as invalid (debug nodes cannot have children)', () => {
    const validation = validate(debugWithChild);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'debug',
      0,
      'text',
      formatAllowedChildrenForError(getSchemaMap().get('debug')!),
    );
  });
});
