import type { ParsedContent } from './types';
import { ParserErrors } from '../errors/messages';
import { parseNodeWithColon, parseNodeWithoutColon } from '../utils/regexPatterns';

type ParseableCategory = 'block' | 'property' | 'conditional' | 'action';

export const parseCategoryContent = (content: string, category: ParseableCategory): ParsedContent => {
  const colonMatch = parseNodeWithColon(content);
  if (colonMatch) {
    return { type: colonMatch.type, data: colonMatch.data, category };
  }

  const noColonMatch = parseNodeWithoutColon(content);
  if (noColonMatch) {
    return { type: noColonMatch.type, data: noColonMatch.data, category };
  }

  throw new Error(ParserErrors.invalidFormat(category, content));
};
