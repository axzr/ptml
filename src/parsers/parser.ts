import type { Node } from '../types';
import { hasPrefix } from '../utils/lineSyntax';
import { getIndentLevel, parseNode } from './parserUtils';
import { parseDeclarationNode } from '../categories/declaration/declaration.parser';
import { assertValidRootDeclaration } from '../validation/validators/validateRootNodes';
import { registerAllParsers } from './registerAllParsers';
import { ParserErrors } from '../errors/messages';

const parseRootNode = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();
  const parsed = parseNode(trimmedLine);
  assertValidRootDeclaration(parsed.type, parsed.data, lineNumbers[startIndex]);
  return parseDeclarationNode(lines, startIndex, lineNumbers);
};

export const parse = (ptml: string): Node[] => {
  registerAllParsers();
  const trimmed = ptml.trim();
  if (!trimmed) {
    return [];
  }

  const lines = trimmed.split('\n');
  const lineNumbers = lines.map((_, index) => index + 1);
  const rootNodes: Node[] = [];
  let currentIndex = 0;

  while (currentIndex < lines.length) {
    const line = lines[currentIndex];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      currentIndex++;
      continue;
    }

    const indent = getIndentLevel(line);
    if (indent === 0 && hasPrefix(trimmedLine)) {
      throw new Error(ParserErrors.rootNodeHasPrefix(lineNumbers[currentIndex]));
    }

    const { node, nextIndex } = parseRootNode(lines, currentIndex, lineNumbers);
    rootNodes.push(node);
    currentIndex = nextIndex;
  }

  return rootNodes;
};
