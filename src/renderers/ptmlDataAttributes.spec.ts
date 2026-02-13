import { describe, it, expect } from 'vitest';
import { buildPtmlDataAttributes, detectStateDataSource } from './ptmlDataAttributes';
import type { RenderContext } from './types';
import type { BlockNode, PropertyNode, DeclarationNode, Node } from '../types';

const createBlockNode = (type: string, lineNumber: number, children: BlockNode['children'] = []): BlockNode => ({
  category: 'block',
  type: type as BlockNode['type'],
  data: '',
  lineNumber,
  children,
});

const createStylesChild = (styleName: string): PropertyNode => ({
  category: 'property',
  type: 'styles' as PropertyNode['type'],
  data: styleName,
  lineNumber: 1,
  children: [],
});

const createDefineNode = (styleName: string, lineNumber: number): DeclarationNode => ({
  category: 'declaration',
  type: 'define' as DeclarationNode['type'],
  data: styleName,
  lineNumber,
  children: [],
});

const createContext = (node: Node, namedStyles: Record<string, Node> = {}): RenderContext => ({
  node,
  namedStyles,
  state: {},
});

describe('buildPtmlDataAttributes', () => {
  it('includes data-ptml-type from node type', () => {
    const node = createBlockNode('box', 5);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-type']).toBe('box');
  });

  it('includes data-ptml-line from node lineNumber', () => {
    const node = createBlockNode('text', 42);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-line']).toBe('42');
  });

  it('omits data-ptml-style when node has no styles children', () => {
    const node = createBlockNode('box', 1);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-style']).toBeUndefined();
  });

  it('includes data-ptml-style when node has a named style reference', () => {
    const defineNode = createDefineNode('card', 10);
    const node = createBlockNode('box', 5, [createStylesChild('card')]);
    const result = buildPtmlDataAttributes(createContext(node, { card: defineNode }));
    expect(result['data-ptml-style']).toBe('card');
  });

  it('includes comma-separated style names for multiple named styles', () => {
    const cardDefine = createDefineNode('card', 10);
    const containerDefine = createDefineNode('container', 20);
    const node = createBlockNode('box', 5, [createStylesChild('card'), createStylesChild('container')]);
    const result = buildPtmlDataAttributes(createContext(node, { card: cardDefine, container: containerDefine }));
    expect(result['data-ptml-style']).toBe('card,container');
  });

  it('ignores styles children with no data', () => {
    const node = createBlockNode('box', 5, [createStylesChild('')]);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-style']).toBeUndefined();
  });

  it('ignores styles children whose data does not match a named style', () => {
    const node = createBlockNode('box', 5, [createStylesChild('missing')]);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-style']).toBeUndefined();
  });

  it('handles text node type correctly', () => {
    const node = createBlockNode('text', 3);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-type']).toBe('text');
    expect(result['data-ptml-line']).toBe('3');
  });

  it('includes data-ptml-file when sourceFilename is provided', () => {
    const node = createBlockNode('box', 5);
    const context = { ...createContext(node), sourceFilename: 'main' };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-file']).toBe('main');
  });

  it('omits data-ptml-file when sourceFilename is undefined', () => {
    const node = createBlockNode('box', 5);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-file']).toBeUndefined();
  });

  it('includes data-ptml-data-source when dataSourceInfo is list', () => {
    const node = createBlockNode('box', 5);
    const context = {
      ...createContext(node),
      dataSourceInfo: { type: 'list' as const, listName: 'fruits', itemIndex: 0 },
    };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBe('list:fruits:0');
  });

  it('includes correct itemIndex in data-ptml-data-source', () => {
    const node = createBlockNode('box', 5);
    const context = {
      ...createContext(node),
      dataSourceInfo: { type: 'list' as const, listName: 'cards', itemIndex: 2 },
    };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBe('list:cards:2');
  });

  it('omits data-ptml-data-source when dataSourceInfo is undefined and no state vars', () => {
    const node = createBlockNode('box', 5);
    const result = buildPtmlDataAttributes(createContext(node));
    expect(result['data-ptml-data-source']).toBeUndefined();
  });

  it('detects state variable in child node data', () => {
    const textChild: PropertyNode = {
      category: 'property',
      type: 'text' as PropertyNode['type'],
      data: '$userName',
      lineNumber: 6,
      children: [],
    };
    const node = createBlockNode('box', 5, [textChild]);
    const context = { ...createContext(node), state: { userName: 'John' } };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBe('state:userName');
  });

  it('includes both list and state data sources when both apply', () => {
    const textChild: PropertyNode = {
      category: 'property',
      type: 'text' as PropertyNode['type'],
      data: '$userName',
      lineNumber: 6,
      children: [],
    };
    const node = createBlockNode('box', 5, [textChild]);
    const context = {
      ...createContext(node),
      state: { userName: 'John' },
      dataSourceInfo: { type: 'list' as const, listName: 'fruits', itemIndex: 0 },
    };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBe('list:fruits:0|state:userName');
  });

  it('includes only list when child references loop variable not state', () => {
    const textChild: PropertyNode = {
      category: 'property',
      type: 'text' as PropertyNode['type'],
      data: '$fruit',
      lineNumber: 6,
      children: [],
    };
    const node = createBlockNode('box', 5, [textChild]);
    const context = {
      ...createContext(node),
      state: {},
      loopVariables: { fruit: 'apple' },
      dataSourceInfo: { type: 'list' as const, listName: 'fruits', itemIndex: 0 },
    };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBe('list:fruits:0');
  });

  it('ignores loop variables when detecting state data source', () => {
    const textChild: PropertyNode = {
      category: 'property',
      type: 'text' as PropertyNode['type'],
      data: '$item',
      lineNumber: 6,
      children: [],
    };
    const node = createBlockNode('box', 5, [textChild]);
    const context = {
      ...createContext(node),
      state: { item: 'fallback' },
      loopVariables: { item: 'loopValue' },
    };
    const result = buildPtmlDataAttributes(context);
    expect(result['data-ptml-data-source']).toBeUndefined();
  });
});

describe('detectStateDataSource', () => {
  it('returns state info when node data references a state variable', () => {
    const node = createBlockNode('box', 5);
    node.data = 'Hello $userName';
    expect(detectStateDataSource(node, { userName: 'John' }, undefined)).toEqual({
      type: 'state',
      variableName: 'userName',
    });
  });

  it('returns state info when child data references a state variable', () => {
    const textChild: PropertyNode = {
      category: 'property',
      type: 'text' as PropertyNode['type'],
      data: '$greeting',
      lineNumber: 6,
      children: [],
    };
    const node = createBlockNode('box', 5, [textChild]);
    expect(detectStateDataSource(node, { greeting: 'Hello' }, undefined)).toEqual({
      type: 'state',
      variableName: 'greeting',
    });
  });

  it('returns null when no state variables are referenced', () => {
    const node = createBlockNode('box', 5);
    node.data = 'plain text';
    expect(detectStateDataSource(node, { userName: 'John' }, undefined)).toBeNull();
  });

  it('returns null when variable is a loop variable', () => {
    const node = createBlockNode('box', 5);
    node.data = '$fruit';
    expect(detectStateDataSource(node, { fruit: 'apple' }, { fruit: 'banana' })).toBeNull();
  });

  it('extracts root variable name from dotted path', () => {
    const node = createBlockNode('box', 5);
    node.data = '$user.name';
    expect(detectStateDataSource(node, { user: { name: 'John' } }, undefined)).toEqual({
      type: 'state',
      variableName: 'user',
    });
  });
});
