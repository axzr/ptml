import type { Node, NodeCategory } from '../types';
import type { ParsedContent } from '../categories/types';
import { parseCategoryContent } from '../categories/parseCategoryContent';
import { parseStateProperty } from '../categories/property/property.parser';
import { assertValidRootDeclaration } from '../validation/validators/validateRootNodes';
import { ParserErrors } from '../errors/messages';
import { getNodeParser, hasNodeParser, type NodeParser } from './nodeParserRegistry';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { hasPrefix } from '../utils/lineSyntax';
import { matchDeclarationWithColon, matchDeclarationWithoutColon } from '../utils/regexPatterns';

export const parseNode = (content: string): { type: string; data: string } => {
  const withColon = matchDeclarationWithColon(content);
  if (withColon) {
    return { type: withColon.type, data: withColon.data };
  }

  const typeOnly = matchDeclarationWithoutColon(content);
  if (typeOnly) {
    return { type: typeOnly.type, data: typeOnly.data };
  }

  throw new Error();
};

export const getIndentLevel = (line: string): number => {
  return line.length - line.trimStart().length;
};

export const getCategoryFromPrefix = (trimmedLine: string): NodeCategory => {
  if (trimmedLine.startsWith('> ')) {
    return 'block';
  }
  if (trimmedLine.startsWith('- ')) {
    return 'property';
  }
  if (trimmedLine.startsWith('? ')) {
    return 'conditional';
  }
  if (trimmedLine.startsWith('! ')) {
    return 'action';
  }

  throw new Error(ParserErrors.unknownCategory(trimmedLine));
};

const parseByCategory = (category: NodeCategory, content: string): ParsedContent => {
  switch (category) {
    case 'block':
    case 'property':
    case 'conditional':
    case 'action':
      return parseCategoryContent(content, category);
    default:
      throw new Error(ParserErrors.unknownCategory(category));
  }
};

export const parseByCategoryForState = (category: NodeCategory, content: string): ParsedContent => {
  switch (category) {
    case 'block':
    case 'conditional':
    case 'action':
      return parseCategoryContent(content, category);
    case 'property':
      return parseStateProperty(content);
    default:
      throw new Error(ParserErrors.unknownCategory(category));
  }
};

export const parseLineContentForChildren = (line: string): ParsedContent => {
  const trimmedLine = line.trim();
  const category = getCategoryFromPrefix(trimmedLine);
  const content = trimmedLine.substring(2);
  return parseByCategory(category, content);
};

export const shouldBreakParsing = (indent: number, parentIndent: number, trimmedLine: string): boolean => {
  if (indent < parentIndent) {
    return true;
  }
  if (indent === parentIndent && !hasPrefix(trimmedLine)) {
    return true;
  }
  return false;
};

const parseAndAddChild = (
  node: Node,
  lines: string[],
  currentIndex: number,
  lineNumbers: number[],
  line: string,
): number => {
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

  const { node: child, nextIndex } = nodeParser(lines, currentIndex, lineNumbers);
  (node.children as Node[]).push(child);
  return nextIndex;
};

const processLine = (
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

  if (shouldBreakParsing(indent, parentIndent, trimmedLine)) {
    return { nextIndex: currentIndex, shouldBreak: true };
  }

  if (indent === parentIndent && hasPrefix(trimmedLine) && node.category !== 'declaration') {
    return { nextIndex: currentIndex, shouldBreak: true };
  }

  return {
    nextIndex: parseAndAddChild(node, lines, currentIndex, lineNumbers, line),
    shouldBreak: false,
  };
};

const parseChildren = (
  node: Node,
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
  parentIndent: number,
): number => {
  let currentIndex = startIndex;

  while (currentIndex < lines.length) {
    const { nextIndex, shouldBreak } = processLine(node, lines, currentIndex, lineNumbers, parentIndent);
    if (shouldBreak) {
      break;
    }
    currentIndex = nextIndex;
  }

  return currentIndex;
};

const parseDefaultBlock: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const parsed = parseLineContentForChildren(line);
  if (!parsed || parsed.category !== 'block') {
    throw new Error(`Failed to parse block on line ${lineNumbers[startIndex]}`);
  }

  const node: Node = {
    category: 'block',
    type: parsed.type,
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

const parseDefaultProperty: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const parsed = parseLineContentForChildren(line);
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
  const nextIndex = parseChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

const parseDefaultConditional: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const parsed = parseLineContentForChildren(line);
  if (!parsed || parsed.category !== 'conditional') {
    throw new Error(`Failed to parse conditional on line ${lineNumbers[startIndex]}`);
  }

  const node: Node = {
    category: 'conditional',
    type: parsed.type,
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

const parseDefaultAction: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const parsed = parseLineContentForChildren(line);
  if (!parsed || parsed.category !== 'action') {
    throw new Error(`Failed to parse action on line ${lineNumbers[startIndex]}`);
  }

  const node: Node = {
    category: 'action',
    type: parsed.type,
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

const parseDefaultDeclaration: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();

  const parsed = parseNode(trimmedLine);
  assertValidRootDeclaration(parsed.type, parsed.data, lineNumbers[startIndex]);

  const node: Node = {
    category: 'declaration',
    type: parsed.type,
    data: parsed.data,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  const parentIndent = line.length - line.trimStart().length;
  const nextIndex = parseChildren(node, lines, startIndex + 1, lineNumbers, parentIndent);

  return { node, nextIndex };
};

export const getDefaultParserForCategory = (category: NodeCategory): NodeParser => {
  switch (category) {
    case 'block':
      return parseDefaultBlock;
    case 'property':
      return parseDefaultProperty;
    case 'conditional':
      return parseDefaultConditional;
    case 'action':
      return parseDefaultAction;
    case 'declaration':
      return parseDefaultDeclaration;
    default:
      throw new Error(`No default parser for category "${String(category)}"`);
  }
};
