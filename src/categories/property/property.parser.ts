import type { ParsedContent } from '../types';
import { ParserErrors } from '../../errors/messages';
import { parseCategoryContent } from '../parseCategoryContent';
import { parseNodeWithColon, parseNodeWithoutColon, splitOnWhitespace } from '../../utils/regexPatterns';

const checkStateArrayItem = (content: string, hasColon: boolean): ParsedContent | null => {
  const contentHasMultipleWords = splitOnWhitespace(content).length > 1;
  const isStateArrayItem = !hasColon && contentHasMultipleWords;

  if (isStateArrayItem) {
    return {
      type: content.trim(),
      data: '',
      category: 'property',
    };
  }

  return null;
};

export const parseStateProperty = (content: string): ParsedContent => {
  const colonMatch = parseNodeWithColon(content);
  const noColonMatch = !colonMatch ? parseNodeWithoutColon(content) : null;

  if (!colonMatch && !noColonMatch) {
    throw new Error(ParserErrors.invalidFormat('property', content));
  }

  const stateArrayItem = checkStateArrayItem(content, !!colonMatch);
  if (stateArrayItem) {
    return stateArrayItem;
  }

  return parseCategoryContent(content, 'property');
};
