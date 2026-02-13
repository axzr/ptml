import { describe, it, expect } from 'vitest';
import { evaluateCondition, getVariableValue } from './conditionals';

const CONDITION_X_IS_EMPTY = '$x is empty';
const CONDITION_X_IS_NOT_EMPTY = '$x is not empty';

describe('evaluateCondition', () => {
  describe('is empty', () => {
    it('returns true when variable is undefined', () => {
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, {}, undefined)).toBe(true);
    });

    it('returns true when variable is null', () => {
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, { x: null }, undefined)).toBe(true);
    });

    it('returns true when variable is empty string', () => {
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, { x: '' }, undefined)).toBe(true);
    });

    it('returns false when variable is non-empty string', () => {
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, { x: 'hello' }, undefined)).toBe(false);
    });

    it('returns false when variable is number', () => {
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, { x: 0 }, undefined)).toBe(false);
      expect(evaluateCondition(CONDITION_X_IS_EMPTY, { x: 42 }, undefined)).toBe(false);
    });
  });

  describe('is not empty', () => {
    it('returns true when variable is non-empty string', () => {
      expect(evaluateCondition(CONDITION_X_IS_NOT_EMPTY, { x: 'hello' }, undefined)).toBe(true);
    });

    it('returns false when variable is undefined', () => {
      expect(evaluateCondition(CONDITION_X_IS_NOT_EMPTY, {}, undefined)).toBe(false);
    });

    it('returns false when variable is null', () => {
      expect(evaluateCondition(CONDITION_X_IS_NOT_EMPTY, { x: null }, undefined)).toBe(false);
    });

    it('returns false when variable is empty string', () => {
      expect(evaluateCondition(CONDITION_X_IS_NOT_EMPTY, { x: '' }, undefined)).toBe(false);
    });
  });

  describe('is empty / is not empty with dot path and loop variables', () => {
    it('returns true for $obj.prop is not empty when prop is non-empty', () => {
      const loopVariables = { obj: { prop: 'hello' } };
      expect(evaluateCondition('$obj.prop is not empty', {}, loopVariables)).toBe(true);
    });

    it('returns false for $obj.prop is not empty when prop is empty string', () => {
      const loopVariables = { obj: { prop: '' } };
      expect(evaluateCondition('$obj.prop is not empty', {}, loopVariables)).toBe(false);
    });

    it('returns true for $obj.prop is empty when prop is empty string', () => {
      const loopVariables = { obj: { prop: '' } };
      expect(evaluateCondition('$obj.prop is empty', {}, loopVariables)).toBe(true);
    });

    it('returns true for $obj.prop is empty when prop is undefined', () => {
      const loopVariables = { obj: {} };
      expect(evaluateCondition('$obj.prop is empty', {}, loopVariables)).toBe(true);
    });
  });

  describe('literal RHS (existing behaviour)', () => {
    it('returns true when variable equals literal value', () => {
      expect(evaluateCondition('$category is Food', { category: 'Food' }, undefined)).toBe(true);
    });

    it('returns false when variable does not equal literal value', () => {
      expect(evaluateCondition('$category is Food', { category: 'Transport' }, undefined)).toBe(false);
    });

    it('returns true when variable equals other variable', () => {
      expect(
        evaluateCondition('$category is $selectedCategory', { category: 'Food', selectedCategory: 'Food' }, undefined),
      ).toBe(true);
    });
  });
});

describe('getVariableValue', () => {
  it('resolves dot path from loop variables', () => {
    const loopVariables = { offer: { tag: 'NO DEPOSIT' } };
    expect(getVariableValue('offer.tag', {}, loopVariables)).toBe('NO DEPOSIT');
  });

  it('resolves dot path from state', () => {
    const state = { user: { name: 'Alice' } };
    expect(getVariableValue('user.name', state, undefined)).toBe('Alice');
  });
});
