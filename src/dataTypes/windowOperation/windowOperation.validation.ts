import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

const KNOWN_OPERATIONS = ['scrollTop'];

export const validateWindowOperation = (value: string, node: Node): void => {
  const trimmed = value.trim();
  if (!KNOWN_OPERATIONS.includes(trimmed)) {
    throw new Error(ValidatorErrors.windowOperationInvalid(node.lineNumber, trimmed, KNOWN_OPERATIONS.join(', ')));
  }
};
