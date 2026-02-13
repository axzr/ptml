import { describe, it, expect } from 'vitest';
import { evaluateBreakpointCondition } from './breakpoints';
import type { BreakpointsConfig } from '../renderers/types';

const TEST_VIEWPORT_WIDTH = 800;
const LABEL_MEDIUM_OR_MORE = 'medium or more';

const breakpoints: BreakpointsConfig = {
  map: { small: 768, medium: 1024, large: undefined },
  labels: ['small', 'medium', 'large'],
};

describe('evaluateBreakpointCondition', () => {
  it('returns false when breakpoints config is undefined', () => {
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, undefined, 'small')).toBe(false);
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, undefined, LABEL_MEDIUM_OR_MORE)).toBe(false);
  });

  it('returns false when data is invalid or empty', () => {
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, breakpoints, '')).toBe(false);
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, breakpoints, '  ')).toBe(false);
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, breakpoints, 'unknown-label')).toBe(false);
  });

  it('evaluates bare label (exact range) correctly', () => {
    expect(evaluateBreakpointCondition(500, breakpoints, 'small')).toBe(true);
    expect(evaluateBreakpointCondition(767, breakpoints, 'small')).toBe(true);
    expect(evaluateBreakpointCondition(768, breakpoints, 'small')).toBe(false);
    expect(evaluateBreakpointCondition(TEST_VIEWPORT_WIDTH, breakpoints, 'medium')).toBe(true);
    expect(evaluateBreakpointCondition(1023, breakpoints, 'medium')).toBe(true);
    expect(evaluateBreakpointCondition(1024, breakpoints, 'medium')).toBe(false);
    expect(evaluateBreakpointCondition(1024, breakpoints, 'large')).toBe(true);
    expect(evaluateBreakpointCondition(2000, breakpoints, 'large')).toBe(true);
  });

  it('evaluates "or more" correctly', () => {
    expect(evaluateBreakpointCondition(767, breakpoints, LABEL_MEDIUM_OR_MORE)).toBe(false);
    expect(evaluateBreakpointCondition(768, breakpoints, LABEL_MEDIUM_OR_MORE)).toBe(true);
    expect(evaluateBreakpointCondition(1024, breakpoints, LABEL_MEDIUM_OR_MORE)).toBe(true);
    expect(evaluateBreakpointCondition(768, breakpoints, 'large or more')).toBe(false);
    expect(evaluateBreakpointCondition(1024, breakpoints, 'large or more')).toBe(true);
  });

  it('evaluates "or less" correctly', () => {
    expect(evaluateBreakpointCondition(1024, breakpoints, 'medium or less')).toBe(false);
    expect(evaluateBreakpointCondition(1023, breakpoints, 'medium or less')).toBe(true);
    expect(evaluateBreakpointCondition(768, breakpoints, 'medium or less')).toBe(true);
    expect(evaluateBreakpointCondition(500, breakpoints, 'small or less')).toBe(true);
  });
});
