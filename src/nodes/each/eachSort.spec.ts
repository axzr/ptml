import { describe, it, expect } from 'vitest';
import { parseSortSpec, compareStateValues, sortListBySpec } from './eachSort';
import type { StateValue } from '../../state/state';

describe('parseSortSpec', () => {
  it('reads a bare property name as ascending', () => {
    expect(parseSortSpec('title')).toEqual({ spec: { path: ['title'], descending: false } });
  });

  it('reads a trailing direction', () => {
    expect(parseSortSpec('title desc')).toEqual({ spec: { path: ['title'], descending: true } });
    expect(parseSortSpec('title asc')).toEqual({ spec: { path: ['title'], descending: false } });
  });

  it('reads a direction on its own as sorting values by themselves', () => {
    expect(parseSortSpec('desc')).toEqual({ spec: { path: null, descending: true } });
    expect(parseSortSpec('asc')).toEqual({ spec: { path: null, descending: false } });
  });

  it('accepts a dotted property path', () => {
    expect(parseSortSpec('contact.name')).toEqual({ spec: { path: ['contact', 'name'], descending: false } });
  });

  it('lets a property genuinely named desc be sorted by, given an explicit direction', () => {
    expect(parseSortSpec('desc asc')).toEqual({ spec: { path: ['desc'], descending: false } });
  });

  it('rejects an empty spec', () => {
    expect(parseSortSpec('')).toEqual({ error: 'empty', found: '(empty)' });
    expect(parseSortSpec(undefined)).toEqual({ error: 'empty', found: '(empty)' });
  });

  it('rejects more than a property and a direction', () => {
    expect(parseSortSpec('a b c')).toEqual({ error: 'tooManyParts', found: 'a b c' });
  });

  it('rejects something that is not a property path', () => {
    expect(parseSortSpec('9lives')).toEqual({ error: 'badPath', found: '9lives' });
    expect(parseSortSpec('two words')).toEqual({ error: 'badPath', found: 'two words' });
  });
});

describe('compareStateValues', () => {
  it('orders numbers numerically', () => {
    expect(compareStateValues(2, 10)).toBeLessThan(0);
  });

  it('orders numbers held as text numerically too', () => {
    expect(compareStateValues('2', '10')).toBeLessThan(0);
  });

  it('reads embedded numbers naturally', () => {
    expect(compareStateValues('item 9', 'item 10')).toBeLessThan(0);
  });

  it('compares text without regard to case', () => {
    expect(compareStateValues('apple', 'Banana')).toBeLessThan(0);
  });

  it('orders false before true', () => {
    expect(compareStateValues(false, true)).toBeLessThan(0);
  });

  it('puts absent values last', () => {
    expect(compareStateValues(null, 'a')).toBeGreaterThan(0);
    expect(compareStateValues('a', null)).toBeLessThan(0);
    expect(compareStateValues(null, null)).toBe(0);
  });
});

describe('sortListBySpec', () => {
  it('does not reorder the list it was given', () => {
    const original = [{ n: 3 }, { n: 1 }, { n: 2 }];
    sortListBySpec(original, { path: ['n'], descending: false });
    expect(original.map((r) => r.n)).toEqual([3, 1, 2]);
  });

  it('keeps equal items in their original order', () => {
    const list = [
      { k: 1, id: 'a' },
      { k: 1, id: 'b' },
      { k: 0, id: 'c' },
    ];
    const sorted = sortListBySpec(list, { path: ['k'], descending: false }) as { id: string }[];
    expect(sorted.map((r) => r.id)).toEqual(['c', 'a', 'b']);
  });

  it('treats descending as ascending reversed, absent values included', () => {
    const list: StateValue[] = [{ n: 2 }, {}, { n: 1 }];
    expect(sortListBySpec(list, { path: ['n'], descending: false })).toEqual([{ n: 1 }, { n: 2 }, {}]);
    expect(sortListBySpec(list, { path: ['n'], descending: true })).toEqual([{}, { n: 2 }, { n: 1 }]);
  });

  it('sorts plain values by themselves when no property is named', () => {
    expect(sortListBySpec(['pear', 'Apple', 'banana'], { path: null, descending: false })).toEqual([
      'Apple',
      'banana',
      'pear',
    ]);
  });
});
