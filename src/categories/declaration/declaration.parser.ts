import type { Node } from '../../types';
import { ParserErrors } from '../../errors/messages';
import { getNodeParser } from '../../parsers/nodeParserRegistry';
import { matchDeclarationWithColon, matchDeclarationWithoutColon } from '../../utils/regexPatterns';

export const parseDeclaration = (content: string): { type: string; data: string } => {
  const hasData = matchDeclarationWithColon(content);
  if (hasData) {
    return { type: hasData.type, data: hasData.data };
  }

  const hasTypeOnly = matchDeclarationWithoutColon(content);
  if (hasTypeOnly) {
    return { type: hasTypeOnly.type, data: hasTypeOnly.data };
  }

  throw new Error(ParserErrors.unmatchedDeclaration(content));
};

export const parseDeclarationNode = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();

  const parsed = parseDeclaration(trimmedLine);
  const nodeParser = getNodeParser(parsed.type);
  return nodeParser(lines, startIndex, lineNumbers);
};
