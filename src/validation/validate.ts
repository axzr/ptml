import type { PtmlFilesMap } from '../types';
import type { ValidationResult } from './types';
import { validateIndentation } from './validators/validateIndentation';
import { validateSemantics } from './validators/validateSemantics';
import { hasPrefix } from '../utils/lineSyntax';
import { RootNodeErrors, IndentationErrors } from '../errors/messages';

const checkForEmptyFile = (ptml: string): void => {
  const trimmed = ptml.trim();

  if (!trimmed) {
    throw new Error(RootNodeErrors.emptyFile());
  }
};

const matchConditionalNode = (text: string): boolean => {
  return /^(if|else):/.test(text);
};

const validateRootNodeIndentation = (ptml: string): void => {
  const lines = ptml.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const indent = line.length - line.trimStart().length;
    const lineHasPrefix = hasPrefix(trimmedLine);

    if (indent > 0) {
      const isConditionalChild = matchConditionalNode(trimmedLine);
      if (!lineHasPrefix && !isConditionalChild) {
        throw new Error(IndentationErrors.rootNodeIndented(i + 1));
      }
    }
  }
};

const validateBasicFormatting = (ptml: string): void => {
  checkForEmptyFile(ptml);
  validateRootNodeIndentation(ptml);
  const lines = ptml.split('\n');
  validateIndentation(lines);
};

export const validate = (ptml: string, files?: PtmlFilesMap): ValidationResult => {
  try {
    validateBasicFormatting(ptml);
    validateSemantics(ptml, files);

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      errorMessage: error instanceof Error ? error.message : 'Invalid format',
    };
  }
};
