import { describe, it, expect } from 'vitest';
import { buildNamedStylesMap, buildBreakpointsMap, getNodeStyles } from './helpers';
import { DataFormatErrors } from '../errors/messages';
import type { Node } from '../types';

const defineNodeWithData = (styleName: string): Node => ({
  category: 'declaration',
  type: 'define',
  data: styleName,
  lineNumber: 1,
  children: [],
});

const defineNodeWithoutData = (): Node => ({
  category: 'declaration',
  type: 'define',
  data: '',
  lineNumber: 1,
  children: [],
});

describe('buildNamedStylesMap', () => {
  it('builds map from define nodes that have data', () => {
    const nodes: Node[] = [defineNodeWithData('myStyle'), defineNodeWithData('otherStyle')];
    const map = buildNamedStylesMap(nodes);
    expect(map.myStyle).toBe(nodes[0]);
    expect(map.otherStyle).toBe(nodes[1]);
    expect(Object.keys(map)).toHaveLength(2);
  });

  it('ignores non-define nodes', () => {
    const boxNode: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [],
    };
    const nodes: Node[] = [boxNode, defineNodeWithData('myStyle')];
    const map = buildNamedStylesMap(nodes);
    expect(map.myStyle).toBe(nodes[1]);
    expect(Object.keys(map)).toHaveLength(1);
  });

  it('throws when a define node has no data', () => {
    const nodes: Node[] = [defineNodeWithoutData()];
    const expectedMessage = DataFormatErrors.missingRequiredPart('define', 1, 'style name');
    expect(() => buildNamedStylesMap(nodes)).toThrow(expectedMessage);
  });

  it('throws on first define node without data when multiple nodes present', () => {
    const nodes: Node[] = [defineNodeWithData('valid'), defineNodeWithoutData()];
    const expectedMessage = DataFormatErrors.missingRequiredPart('define', 1, 'style name');
    expect(() => buildNamedStylesMap(nodes)).toThrow(expectedMessage);
  });
});

describe('buildBreakpointsMap', () => {
  it('returns undefined when no breakpoints node', () => {
    const nodes: Node[] = [defineNodeWithData('myStyle')];
    const result = buildBreakpointsMap(nodes);
    expect(result).toBeUndefined();
  });

  it('returns map and labels when breakpoints node has children', () => {
    const nodes: Node[] = [
      {
        category: 'declaration',
        type: 'breakpoints',
        data: '',
        lineNumber: 1,
        children: [
          { category: 'property', type: 'small', data: '768', lineNumber: 2, children: [] },
          { category: 'property', type: 'medium', data: '1024', lineNumber: 3, children: [] },
          { category: 'property', type: 'large', data: '', lineNumber: 4, children: [] },
        ],
      },
    ];
    const result = buildBreakpointsMap(nodes);
    expect(result).toBeDefined();
    expect(result?.map.small).toBe(768);
    expect(result?.map.medium).toBe(1024);
    expect(result?.map.large).toBeUndefined();
    expect(result?.labels).toEqual(['small', 'medium', 'large']);
  });
});

describe('getNodeStyles', () => {
  it('returns undefined when node has no styles children', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [],
    };
    const result = getNodeStyles(node, {});
    expect(result).toBeUndefined();
  });

  it('returns undefined when styleNodes exist but yield no properties', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [],
        },
      ],
    };
    const result = getNodeStyles(node, {});
    expect(result).toEqual(undefined);
  });

  it('applies inline style properties from styles child', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [
            {
              category: 'property',
              type: 'color',
              data: 'red',
              lineNumber: 3,
              children: [],
            },
          ],
        },
      ],
    };
    const result = getNodeStyles(node, {});
    expect(result).toEqual({ color: 'red' });
  });

  it('applies breakpoint styles from named style when viewportWidth and breakpoints match', () => {
    const namedStyleNode: Node = {
      category: 'declaration',
      type: 'define',
      data: 'card',
      lineNumber: 1,
      children: [
        {
          category: 'block',
          type: 'breakpoint',
          data: 'small',
          lineNumber: 2,
          children: [{ category: 'property', type: 'display', data: 'flex', lineNumber: 3, children: [] }],
        },
        {
          category: 'block',
          type: 'breakpoint',
          data: 'large',
          lineNumber: 4,
          children: [{ category: 'property', type: 'display', data: 'block', lineNumber: 5, children: [] }],
        },
      ],
    };
    const breakpoints = {
      map: { small: 768, medium: 1024, large: undefined },
      labels: ['small', 'medium', 'large'],
    };
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: 'card',
          lineNumber: 2,
          children: [],
        },
      ],
    };
    const namedStyles = { card: namedStyleNode };
    const resultSmall = getNodeStyles(node, namedStyles, {}, undefined, 500, breakpoints);
    expect(resultSmall?.display).toBe('flex');
    const resultLarge = getNodeStyles(node, namedStyles, {}, undefined, 1200, breakpoints);
    expect(resultLarge?.display).toBe('block');
  });

  it('does not apply breakpoint styles from named style when viewportWidth is omitted', () => {
    const namedStyleNode: Node = {
      category: 'declaration',
      type: 'define',
      data: 'card',
      lineNumber: 1,
      children: [
        {
          category: 'block',
          type: 'breakpoint',
          data: 'small',
          lineNumber: 2,
          children: [{ category: 'property', type: 'display', data: 'flex', lineNumber: 3, children: [] }],
        },
      ],
    };
    const breakpoints = {
      map: { small: 768, large: 768 },
      labels: ['small', 'large'],
    };
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: 'card',
          lineNumber: 2,
          children: [],
        },
      ],
    };
    const namedStyles = { card: namedStyleNode };
    const result = getNodeStyles(node, namedStyles, {}, undefined, undefined, breakpoints);
    expect(result?.display).toBeUndefined();
  });

  it('interpolates CSS property value from state when value starts with $', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [
            {
              category: 'property',
              type: 'color',
              data: '$themeColor',
              lineNumber: 3,
              children: [],
            },
          ],
        },
      ],
    };
    const state = { themeColor: '#ff00ff' };
    const result = getNodeStyles(node, {}, state);
    expect(result).toEqual({ color: '#ff00ff' });
  });

  it('interpolates CSS property value from loop variable when value starts with $', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [
            {
              category: 'property',
              type: 'background-color',
              data: '$item.color',
              lineNumber: 3,
              children: [],
            },
          ],
        },
      ],
    };
    const loopVariables = { item: { color: 'blue' } };
    const result = getNodeStyles(node, {}, {}, loopVariables);
    expect(result).toEqual({ backgroundColor: 'blue' });
  });

  it('uses literal value when property value does not start with $', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [
            {
              category: 'property',
              type: 'color',
              data: 'red',
              lineNumber: 3,
              children: [],
            },
          ],
        },
      ],
    };
    const result = getNodeStyles(node, {});
    expect(result).toEqual({ color: 'red' });
  });

  it('omits property when $ path does not resolve', () => {
    const node: Node = {
      category: 'block',
      type: 'box',
      data: '',
      lineNumber: 1,
      children: [
        {
          category: 'property',
          type: 'styles',
          data: '',
          lineNumber: 2,
          children: [
            {
              category: 'property',
              type: 'color',
              data: '$missing',
              lineNumber: 3,
              children: [],
            },
          ],
        },
      ],
    };
    const result = getNodeStyles(node, {}, {});
    expect(result).toEqual(undefined);
  });
});
