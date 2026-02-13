import type { BreakpointsConfig } from '../renderers/types';

const BREAKPOINT_DATA_REGEX = /^([a-zA-Z][a-zA-Z0-9_-]*)\s*(or\s+more|or\s+less)?\s*$/;

type ParsedBreakpointData = { label: string; modifier: 'exact' | 'or more' | 'or less' };

const parseBreakpointData = (data: string): ParsedBreakpointData | null => {
  const trimmed = (data ?? '').trim();
  if (!trimmed) return null;
  const match = trimmed.match(BREAKPOINT_DATA_REGEX);
  if (!match) return null;
  const label = match[1].trim();
  const modifierStr = match[2]?.trim().toLowerCase();
  const modifier = modifierStr === 'or more' ? 'or more' : modifierStr === 'or less' ? 'or less' : 'exact';
  return { label, modifier };
};

const getLabelRange = (label: string, config: BreakpointsConfig): { start: number; end: number } | null => {
  const index = config.labels.indexOf(label);
  if (index === -1) return null;
  const start = index === 0 ? 0 : (config.map[config.labels[index - 1]] ?? 0);
  const endValue = config.map[label];
  const end = endValue === undefined ? Number.POSITIVE_INFINITY : endValue;
  return { start, end };
};

export const evaluateBreakpointCondition = (
  viewportWidth: number,
  breakpoints: BreakpointsConfig | undefined,
  data: string,
): boolean => {
  if (breakpoints === undefined) return false;
  const parsed = parseBreakpointData(data);
  if (!parsed) return false;
  const range = getLabelRange(parsed.label, breakpoints);
  if (!range) return false;
  if (parsed.modifier === 'exact') {
    return viewportWidth >= range.start && viewportWidth < range.end;
  }
  if (parsed.modifier === 'or more') {
    return viewportWidth >= range.start;
  }
  return viewportWidth < range.end;
};
