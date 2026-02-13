import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

export const validateFunctionName = (value: string, node: Node): void => {
  const trimmed = value.trim();
  if (trimmed.startsWith('$')) {
    throw new Error(ValidatorErrors.functionNameStartsWithDollar(node.type, node.lineNumber, trimmed));
  }
};
