import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ValidatorErrors } from '../../errors/messages';

const LABEL_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const BREAKPOINT_DATA_REGEX = /^([a-zA-Z][a-zA-Z0-9_-]*)\s*(or\s+more|or\s+less)?\s*$/;

export const validateBreakpointReference = (value: string, node: Node, _context?: ValidationContext): void => {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    throw new Error(ValidatorErrors.breakpointReferenceInvalid(node.type, node.lineNumber, '(empty)'));
  }
  const match = trimmed.match(BREAKPOINT_DATA_REGEX);
  if (!match) {
    throw new Error(ValidatorErrors.breakpointReferenceInvalid(node.type, node.lineNumber, trimmed));
  }
  const label = match[1].trim();
  if (!LABEL_REGEX.test(label)) {
    throw new Error(ValidatorErrors.breakpointReferenceInvalid(node.type, node.lineNumber, trimmed));
  }
};
