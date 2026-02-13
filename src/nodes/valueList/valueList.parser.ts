import type { Node } from '../../types';
import type { NodeParser } from '../../parsers/nodeParserRegistry';
import { getIndentLevel, parseLineContentForChildren } from '../../parsers/parserUtils';
import { hasPrefix } from '../../utils/lineSyntax';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { ParserErrors, ChildrenErrors } from '../../errors/messages';
import { parseListDeclarationWithColon, parseListDeclarationNoColon } from '../../utils/regexPatterns';

const nodeType = 'valueList';

const isValidValueItem = (trimmedLine: string, indent: number, parentIndent: number): boolean => {
  return indent === parentIndent && trimmedLine.startsWith('- ') && !trimmedLine.includes(':');
};

const parseValueItem = (parentNode: Node, lines: string[], currentIndex: number, lineNumbers: number[]): number => {
  const line = lines[currentIndex];
  const trimmedLine = line.trim();

  if (!trimmedLine.startsWith('- ')) {
    throw new Error(ParserErrors.valueItemPrefixExpected(lineNumbers[currentIndex]));
  }

  const content = trimmedLine.substring(2).trim();
  const node: Node = {
    category: 'property',
    type: 'value',
    data: content,
    children: [],
    lineNumber: lineNumbers[currentIndex],
  };

  const nextIndex = currentIndex + 1;
  (parentNode.children as Node[]).push(node);
  return nextIndex;
};

const throwInvalidChildError = (trimmedLine: string, nodeLineNumber: number): never => {
  const parsed = parseLineContentForChildren(trimmedLine);
  const schema = getSchemaMap().get(nodeType);
  const allowedChildren = schema ? formatAllowedChildrenForError(schema) : 'none';
  throw new Error(ChildrenErrors.wrongChildType(nodeType, nodeLineNumber, parsed.type, allowedChildren));
};

const processSameIndentLine = (
  trimmedLine: string,
  indent: number,
  parentIndent: number,
  parentNode: Node,
  lines: string[],
  currentIndex: number,
  lineNumbers: number[],
): { nextIndex: number; shouldBreak: boolean } => {
  if (isValidValueItem(trimmedLine, indent, parentIndent)) {
    const nextIndex = parseValueItem(parentNode, lines, currentIndex, lineNumbers);
    return { nextIndex, shouldBreak: false };
  }
  if (hasPrefix(trimmedLine)) {
    throwInvalidChildError(trimmedLine, parentNode.lineNumber);
  }
  return { nextIndex: currentIndex, shouldBreak: true };
};

const processDeeperIndentLine = (
  trimmedLine: string,
  indent: number,
  parentIndent: number,
  parentNode: Node,
  lines: string[],
  currentIndex: number,
  lineNumbers: number[],
): { nextIndex: number; shouldBreak: boolean } => {
  if (isValidValueItem(trimmedLine, indent, parentIndent)) {
    const nextIndex = parseValueItem(parentNode, lines, currentIndex, lineNumbers);
    return { nextIndex, shouldBreak: false };
  }
  if (hasPrefix(trimmedLine)) {
    throwInvalidChildError(trimmedLine, parentNode.lineNumber);
  }
  return { nextIndex: currentIndex + 1, shouldBreak: false };
};

const processValueListLine = (
  parentNode: Node,
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

  if (indent < parentIndent) {
    return { nextIndex: currentIndex, shouldBreak: true };
  }

  if (indent === parentIndent) {
    return processSameIndentLine(trimmedLine, indent, parentIndent, parentNode, lines, currentIndex, lineNumbers);
  }

  return processDeeperIndentLine(trimmedLine, indent, parentIndent, parentNode, lines, currentIndex, lineNumbers);
};

const parseValueListChildren = (
  parentNode: Node,
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): number => {
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const { nextIndex, shouldBreak } = processValueListLine(parentNode, lines, currentIndex, lineNumbers, parentIndent);
    if (shouldBreak) {
      return nextIndex;
    }
    currentIndex = nextIndex;
  }

  return currentIndex;
};

const parseValueListData = (trimmedLine: string, lineNumber: number): string => {
  const declarationData = parseListDeclarationWithColon(nodeType, trimmedLine);
  if (declarationData !== null) {
    return declarationData;
  }

  if (parseListDeclarationNoColon(nodeType, trimmedLine)) {
    return '';
  }

  throw new Error(ParserErrors.valueListDeclarationExpected(lineNumber));
};

export const parseValueList: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();
  const listName = parseValueListData(trimmedLine, lineNumbers[startIndex]);

  const node: Node = {
    category: 'declaration',
    type: nodeType,
    data: listName,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseValueListChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};
