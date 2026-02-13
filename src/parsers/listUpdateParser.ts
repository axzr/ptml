import type { Node } from '../types';
import { splitOnWhitespace, matchWhereCondition } from '../utils/regexPatterns';

export const parseListUpdateData = (data: string | undefined): { listName: string | null } => {
  if (!data) {
    return { listName: null };
  }

  const trimmed = data.trim();
  const parts = splitOnWhitespace(trimmed);

  if (parts.length < 1) {
    return { listName: null };
  }

  const listName = parts[0];
  return { listName };
};

export const parseWhereCondition = (whereNode: Node): { propertyName: string | null; matchValue: string | null } => {
  if (!whereNode.data) {
    return { propertyName: null, matchValue: null };
  }

  const trimmed = whereNode.data.trim();
  const whereMatch = matchWhereCondition(trimmed);

  if (!whereMatch) {
    return { propertyName: null, matchValue: null };
  }

  const propertyName = whereMatch.propertyName;
  const matchValue = whereMatch.matchValue;

  return { propertyName, matchValue };
};
