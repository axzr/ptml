import type { Node } from '../../types';
import type { NodeParser } from '../../parsers/nodeParserRegistry';
import { parseDeclaration } from '../../categories/declaration/declaration.parser';
import {
  getCategoryFromPrefix,
  getIndentLevel,
  parseByCategoryForState,
  shouldBreakParsing,
} from '../../parsers/parserUtils';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { ChildrenErrors } from '../../errors/messages';
import type { ParsedContent } from '../../categories/types';

const parseStatePropertyNode: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const parsed = parseLineContentForStateChildren(line);
  if (!parsed || parsed.category !== 'property') {
    throw new Error(`Failed to parse property on line ${lineNumbers[startIndex]}`);
  }

  const node: Node = {
    category: 'property',
    type: parsed.type,
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseStateChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

const parseAndAddStateChild = (
  parentNode: Node,
  lines: string[],
  currentIndex: number,
  lineNumbers: number[],
  line: string,
): number => {
  const parsedContent = parseLineContentForStateChildren(line);
  if (parsedContent.category === 'property') {
    const { node, nextIndex } = parseStatePropertyNode(lines, currentIndex, lineNumbers);
    (parentNode.children as Node[]).push(node);
    return nextIndex;
  }

  const stateSchema = getSchemaMap().get('state');
  const allowedChildren = stateSchema ? formatAllowedChildrenForError(stateSchema) : 'none';
  throw new Error(ChildrenErrors.wrongChildType('state', parentNode.lineNumber, parsedContent.type, allowedChildren));
};

const processStateLine = (
  node: Node,
  lines: string[],
  currentIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): { nextIndex: number; shouldBreak: boolean } => {
  const line = lines[currentIndex];
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return { nextIndex: currentIndex + 1, shouldBreak: false };
  }

  const indent = getIndentLevel(line);

  if (node.category === 'property' && indent === parentIndent && trimmedLine.startsWith('- ')) {
    return { nextIndex: currentIndex, shouldBreak: true };
  }

  if (shouldBreakParsing(indent, parentIndent, trimmedLine)) {
    return { nextIndex: currentIndex, shouldBreak: true };
  }

  return {
    nextIndex: parseAndAddStateChild(node, lines, currentIndex, lineNumbers, line),
    shouldBreak: false,
  };
};

export const parseStateChildren = (
  parentNode: Node,
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): number => {
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const { nextIndex, shouldBreak } = processStateLine(parentNode, lines, currentIndex, lineNumbers, parentIndent);
    if (shouldBreak) {
      break;
    }
    currentIndex = nextIndex;
  }

  return currentIndex;
};

export const parseState: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();

  const parsed = parseDeclaration(trimmedLine);

  const node: Node = {
    category: 'declaration',
    type: 'state',
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseStateChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

export const parseLineContentForStateChildren = (line: string): ParsedContent => {
  const trimmedLine = line.trim();
  const category = getCategoryFromPrefix(trimmedLine);
  const content = trimmedLine.substring(2);
  return parseByCategoryForState(category, content);
};
