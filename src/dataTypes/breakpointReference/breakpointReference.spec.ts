import { describe, it, expect } from 'vitest';
import { validateBreakpointReference } from './breakpointReference.validation';
import type { Node } from '../../types';

const node: Node = {
  category: 'block',
  type: 'breakpoint',
  data: '',
  lineNumber: 1,
  children: [],
};

describe('validateBreakpointReference', () => {
  it('accepts bare label', () => {
    expect(() => validateBreakpointReference('small', node)).not.toThrow();
    expect(() => validateBreakpointReference('medium', node)).not.toThrow();
    expect(() => validateBreakpointReference('large', node)).not.toThrow();
  });

  it('accepts "label or more"', () => {
    expect(() => validateBreakpointReference('small or more', node)).not.toThrow();
    expect(() => validateBreakpointReference('medium or more', node)).not.toThrow();
  });

  it('accepts "label or less"', () => {
    expect(() => validateBreakpointReference('small or less', node)).not.toThrow();
    expect(() => validateBreakpointReference('medium or less', node)).not.toThrow();
  });

  it('rejects empty or whitespace', () => {
    expect(() => validateBreakpointReference('', node)).toThrow();
    expect(() => validateBreakpointReference('  ', node)).toThrow();
  });

  it('rejects invalid format', () => {
    expect(() => validateBreakpointReference('small or', node)).toThrow();
    expect(() => validateBreakpointReference('123', node)).toThrow();
    expect(() => validateBreakpointReference('or more', node)).toThrow();
  });

  describe('against the declared breakpoint labels', () => {
    const context = { stack: [], availableBreakpoints: new Set(['small', 'medium']) };

    it('accepts a declared label, with or without a modifier', () => {
      expect(() => validateBreakpointReference('small', node, context)).not.toThrow();
      expect(() => validateBreakpointReference('medium or more', node, context)).not.toThrow();
      expect(() => validateBreakpointReference('small or less', node, context)).not.toThrow();
    });

    it('rejects a label no breakpoints declaration defines', () => {
      expect(() => validateBreakpointReference('large', node, context)).toThrow(/not defined in a breakpoints/);
      expect(() => validateBreakpointReference('large or more', node, context)).toThrow(/not defined in a breakpoints/);
    });

    it('rejects every label when nothing is declared', () => {
      const empty = { stack: [], availableBreakpoints: new Set<string>() };
      expect(() => validateBreakpointReference('small', node, empty)).toThrow(/not defined in a breakpoints/);
    });

    it('skips the check when there is no validation context to check against', () => {
      expect(() => validateBreakpointReference('large', node)).not.toThrow();
    });
  });
});
