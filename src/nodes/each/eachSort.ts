import type { Node } from '../../types';
import type { StateValue } from '../../state/state';

export type SortSpec = {
  // null means sort items by their own value, for a list of plain values.
  path: string[] | null;
  descending: boolean;
};

const DIRECTIONS = new Set(['asc', 'desc']);
const PROPERTY_PATH_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*(\.[A-Za-z_][A-Za-z0-9_-]*)*$/;

export type ParsedSort = { spec: SortSpec } | { error: 'empty' | 'tooManyParts' | 'badPath'; found: string };

// "title"        -> by the title property, ascending
// "title desc"   -> by the title property, descending
// "desc"         -> by each item's own value, descending
// A property genuinely called asc or desc still works, by giving the direction
// explicitly: "desc asc" sorts by the property "desc", ascending.
export const parseSortSpec = (data: string | undefined): ParsedSort => {
  const trimmed = (data ?? '').trim();
  if (!trimmed) {
    return { error: 'empty', found: '(empty)' };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length > 2) {
    return { error: 'tooManyParts', found: trimmed };
  }

  const last = parts[parts.length - 1].toLowerCase();
  const hasDirection = DIRECTIONS.has(last);
  const descending = hasDirection && last === 'desc';
  const pathParts = hasDirection ? parts.slice(0, -1) : parts;

  if (pathParts.length === 0) {
    return { spec: { path: null, descending } };
  }
  if (pathParts.length > 1 || !PROPERTY_PATH_PATTERN.test(pathParts[0])) {
    return { error: 'badPath', found: pathParts.join(' ') };
  }
  return { spec: { path: pathParts[0].split('.'), descending } };
};

const readPath = (item: StateValue, path: string[] | null): StateValue => {
  if (path === null) {
    return item;
  }
  let value: StateValue = item;
  for (const key of path) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return null;
    }
    value = value[key];
    if (value === undefined) {
      return null;
    }
  }
  return value;
};

const rank = (value: StateValue): number | string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  // Objects and arrays have no sensible ordering; treat them as absent.
  return null;
};

export const compareStateValues = (a: StateValue, b: StateValue): number => {
  const left = rank(a);
  const right = rank(b);

  // Absent values sort last ascending, which reverses to first descending --
  // descending is exactly ascending reversed, with no special cases.
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  // numeric: true gives "item 10" after "item 9" rather than before it, which
  // is what anyone eyeballing a prototype expects.
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
};

export const sortListBySpec = (list: StateValue[], spec: SortSpec): StateValue[] => {
  // Copy: the list in state must not be reordered by being displayed.
  const sorted = [...list].sort((a, b) => compareStateValues(readPath(a, spec.path), readPath(b, spec.path)));
  // Array.prototype.sort is stable, so equal items keep their original order.
  return spec.descending ? sorted.reverse() : sorted;
};

export const getSortSpecForEach = (node: Node): SortSpec | null => {
  const sortNode = node.children.find((child) => child.type === 'sort');
  if (!sortNode) {
    return null;
  }
  const parsed = parseSortSpec(sortNode.data);
  return 'spec' in parsed ? parsed.spec : null;
};

export const applyEachSort = (node: Node, list: StateValue[]): StateValue[] => {
  const spec = getSortSpecForEach(node);
  return spec ? sortListBySpec(list, spec) : list;
};
