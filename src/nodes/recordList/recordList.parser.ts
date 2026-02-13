import type { Node } from '../../types';
import type { NodeParser } from '../../parsers/nodeParserRegistry';
import {
  getIndentLevel,
  parseLineContentForChildren,
  shouldBreakParsing,
  getDefaultParserForCategory,
} from '../../parsers/parserUtils';
import { getNodeParser, hasNodeParser } from '../../parsers/nodeParserRegistry';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { hasPrefix } from '../../utils/lineSyntax';
import { ParserErrors, ChildrenErrors } from '../../errors/messages';
import { parseListDeclarationWithColon, parseListDeclarationNoColon } from '../../utils/regexPatterns';

const nodeType = 'recordList';

const isValidRecordItem = (trimmedLine: string, indent: number, parentIndent: number): boolean => {
  return indent === parentIndent && (trimmedLine.startsWith('- record:') || trimmedLine === '- record');
};

const parseRecordChild = (recordNode: Node, lines: string[], currentIndex: number, lineNumbers: number[]): number => {
  const line = lines[currentIndex];
  const parsedContent = parseLineContentForChildren(line);
  let nodeParser: NodeParser;
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(parsedContent.type);
  const shouldUseRegisteredParser =
    hasNodeParser(parsedContent.type) && (!schema || schema.category === parsedContent.category);
  if (shouldUseRegisteredParser) {
    nodeParser = getNodeParser(parsedContent.type);
  } else {
    nodeParser = getDefaultParserForCategory(parsedContent.category);
  }
  const { node, nextIndex } = nodeParser(lines, currentIndex, lineNumbers);
  (recordNode.children as Node[]).push(node);
  return nextIndex;
};

const parseRecordItemChildren = (
  node: Node,
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): number => {
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const line = lines[currentIndex];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      currentIndex++;
      continue;
    }

    const indent = getIndentLevel(line);

    if (shouldBreakParsing(indent, parentIndent, trimmedLine)) {
      break;
    }

    if (indent === parentIndent && hasPrefix(trimmedLine) && node.category !== 'declaration') {
      break;
    }

    currentIndex = parseRecordChild(node, lines, currentIndex, lineNumbers);
  }

  return currentIndex;
};

const parseRecordItem = (parentNode: Node, lines: string[], currentIndex: number, lineNumbers: number[]): number => {
  const line = lines[currentIndex];
  const trimmedLine = line.trim();

  if (!trimmedLine.startsWith('- record')) {
    throw new Error(ParserErrors.valueItemPrefixExpected(lineNumbers[currentIndex]));
  }

  const content = trimmedLine.startsWith('- record:') ? trimmedLine.substring(9).trim() : '';
  const node: Node = {
    category: 'property',
    type: 'record',
    data: content,
    children: [],
    lineNumber: lineNumbers[currentIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseRecordItemChildren(node, lines, currentIndex + 1, lineNumbers, parentIndent);
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
  if (isValidRecordItem(trimmedLine, indent, parentIndent)) {
    const nextIndex = parseRecordItem(parentNode, lines, currentIndex, lineNumbers);
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
  if (isValidRecordItem(trimmedLine, indent, parentIndent)) {
    const nextIndex = parseRecordItem(parentNode, lines, currentIndex, lineNumbers);
    return { nextIndex, shouldBreak: false };
  }
  if (hasPrefix(trimmedLine)) {
    throwInvalidChildError(trimmedLine, parentNode.lineNumber);
  }
  return { nextIndex: currentIndex, shouldBreak: true };
};

const processRecordListLine = (
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

const parseRecordListChildren = (
  parentNode: Node,
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): number => {
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const { nextIndex, shouldBreak } = processRecordListLine(
      parentNode,
      lines,
      currentIndex,
      lineNumbers,
      parentIndent,
    );
    if (shouldBreak) {
      return nextIndex;
    }
    currentIndex = nextIndex;
  }

  return currentIndex;
};

const parseRecordListData = (trimmedLine: string, lineNumber: number): string => {
  const declarationData = parseListDeclarationWithColon(nodeType, trimmedLine);
  if (declarationData !== null) {
    return declarationData;
  }

  if (parseListDeclarationNoColon(nodeType, trimmedLine)) {
    return '';
  }

  throw new Error(ParserErrors.recordListDeclarationExpected(lineNumber));
};

export const parseRecordList: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();
  const listName = parseRecordListData(trimmedLine, lineNumbers[startIndex]);

  const node: Node = {
    category: 'declaration',
    type: nodeType,
    data: listName,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseRecordListChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};
