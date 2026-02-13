import { describe, it, expect } from 'vitest';
import { validateBoxRole } from './boxRole.validation';
import type { Node } from '../../types';

const createNode = (type: string, lineNumber: number): Node => ({
  category: 'property',
  type,
  data: '',
  children: [],
  lineNumber,
});

describe('validateBoxRole', () => {
  it('accepts main', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('main', node)).not.toThrow();
  });

  it('accepts header', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('header', node)).not.toThrow();
  });

  it('accepts footer', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('footer', node)).not.toThrow();
  });

  it('accepts article', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('article', node)).not.toThrow();
  });

  it('accepts section', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('section', node)).not.toThrow();
  });

  it('accepts nav', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('nav', node)).not.toThrow();
  });

  it('accepts aside', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('aside', node)).not.toThrow();
  });

  it('accepts case-insensitive value', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('MAIN', node)).not.toThrow();
    expect(() => validateBoxRole('Article', node)).not.toThrow();
  });

  it('rejects invalid role', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('invalid', node)).toThrow();
  });

  it('rejects body', () => {
    const node = createNode('role', 1);
    expect(() => validateBoxRole('body', node)).toThrow();
  });
});
