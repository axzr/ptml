import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { DataFormatErrors } from '../../errors/messages';

const SIMPLE_FILENAME = /^[\w.-]+\.ptml$/;

export const validateImportFilename = (value: string, node: Node, _context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (trimmed.includes('/') || trimmed.includes('\\') || !SIMPLE_FILENAME.test(trimmed)) {
    throw new Error(DataFormatErrors.invalidImportFilename(node.type, node.lineNumber, trimmed));
  }
};
