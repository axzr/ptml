import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ValidatorErrors } from '../../errors/messages';

export const validateStyleName = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (trimmed.includes(' ')) {
    throw new Error(ValidatorErrors.styleNameInvalid(node.type, node.lineNumber, trimmed));
  }
  if (trimmed && context?.availableDefines && !context.availableDefines.has(trimmed)) {
    throw new Error(ValidatorErrors.styleNameNotFound(node.type, node.lineNumber, trimmed));
  }
};
