import { hasPrefix } from '../../utils/lineSyntax';
import { IndentationErrors } from '../../errors/messages';

type ValidationError = {
  nodeType: string;
  lineNumber: number;
  expectedIndent: number;
  actualIndent: number;
};

const formatIndentationError = (error: ValidationError): string => {
  const { nodeType, lineNumber, expectedIndent, actualIndent } = error;
  return IndentationErrors.incorrectIndentation(nodeType, lineNumber, expectedIndent, actualIndent);
};

const calculateExpectedIndent = (indentStack: number[], lastRootIndent: number): number => {
  const parentIndent = indentStack.length > 0 ? indentStack[indentStack.length - 1] : lastRootIndent;
  return parentIndent + 2;
};

const validateFirstChild = (indent: number, nodeType: string, lineNumber: number): { shouldPush: boolean } => {
  if (indent !== 0) {
    const error: ValidationError = { nodeType, lineNumber, expectedIndent: 0, actualIndent: indent };
    throw new Error(formatIndentationError(error));
  }
  return { shouldPush: true };
};

const validateChildIndentation = (
  indent: number,
  indentStack: number[],
  lastRootIndent: number,
  nodeType: string,
  lineNumber: number,
): { shouldPush: boolean } => {
  while (indentStack.length > 1 && indentStack[indentStack.length - 1] >= indent) {
    indentStack.pop();
  }

  if (indentStack.length === 0) {
    return validateFirstChild(indent, nodeType, lineNumber);
  }

  const isSibling = indent === indentStack[indentStack.length - 1];
  if (isSibling) {
    return { shouldPush: false };
  }

  const expectedIndent = calculateExpectedIndent(indentStack, lastRootIndent);
  if (indent === expectedIndent) {
    return { shouldPush: true };
  }

  const error: ValidationError = { nodeType, lineNumber, expectedIndent, actualIndent: indent };
  throw new Error(formatIndentationError(error));
};

const extractNodeNameFromContent = (text: string): string | null => {
  const match = text.match(/^([\w.-]+)(?::\s?.*)?$/);
  return match ? match[1] : null;
};

const parseNodeType = (line: string): string => {
  const trimmed = line.trim();
  if (!trimmed) {
    return 'unknown';
  }

  const content = hasPrefix(trimmed) ? trimmed.substring(2) : trimmed;
  const nodeName = extractNodeNameFromContent(content);
  return nodeName || 'unknown';
};

const validateLineBasicRules = (indent: number, lineNumber: number, trimmedLine: string): boolean => {
  if (indent % 2 !== 0) {
    throw new Error(IndentationErrors.oddIndentation(lineNumber, indent));
  }

  const isChild = hasPrefix(trimmedLine);

  if (indent > 0 && !isChild) {
    throw new Error(IndentationErrors.missingPrefix(lineNumber));
  }

  return !isChild;
};

const processChildLine = (
  line: string,
  indent: number,
  indentStack: number[],
  lastRootIndent: number,
  lineNumber: number,
): {
  shouldPush: boolean;
  newIndent: number;
} => {
  const nodeType = parseNodeType(line);
  const result = validateChildIndentation(indent, indentStack, lastRootIndent, nodeType, lineNumber);
  return {
    shouldPush: result.shouldPush,
    newIndent: indent,
  };
};

const processEmptyLine = (
  lastRootIndent: number,
): {
  shouldReset: boolean;
  shouldPush: boolean;
  newIndent: number;
} => {
  return { shouldReset: false, shouldPush: false, newIndent: lastRootIndent };
};

const processRootLine = (): {
  shouldReset: boolean;
  shouldPush: boolean;
  newIndent: number;
} => {
  return { shouldReset: true, shouldPush: false, newIndent: -2 };
};

const processValidChildLine = (
  line: string,
  indent: number,
  indentStack: number[],
  lastRootIndent: number,
  lineNumber: number,
): {
  shouldReset: boolean;
  shouldPush: boolean;
  newIndent: number;
} => {
  const childResult = processChildLine(line, indent, indentStack, lastRootIndent, lineNumber);
  return {
    shouldReset: false,
    shouldPush: childResult.shouldPush,
    newIndent: childResult.newIndent,
  };
};

const validateLineIndentation = (
  line: string,
  indentStack: number[],
  lastRootIndent: number,
  lineNumber: number,
): {
  shouldReset: boolean;
  shouldPush: boolean;
  newIndent: number;
} => {
  const trimmedLine = line.trim();
  if (!trimmedLine) {
    return processEmptyLine(lastRootIndent);
  }

  const indent = line.length - line.trimStart().length;

  const isRoot = validateLineBasicRules(indent, lineNumber, trimmedLine);

  if (isRoot) {
    return processRootLine();
  }

  return processValidChildLine(line, indent, indentStack, lastRootIndent, lineNumber);
};

export const validateIndentation = (lines: string[]): void => {
  const indentStack: number[] = [];
  let lastRootIndent = -2;

  for (let i = 0; i < lines.length; i++) {
    const lineResult = validateLineIndentation(lines[i], indentStack, lastRootIndent, i + 1);

    if (lineResult.shouldReset) {
      indentStack.length = 0;
      lastRootIndent = -2;
    } else if (lineResult.shouldPush) {
      indentStack.push(lineResult.newIndent);
    }
    lastRootIndent = lineResult.newIndent;
  }
};
