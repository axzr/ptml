import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

export const validateParameterName = (value: string, node: Node): void => {
  const trimmed = value.trim();
  if (trimmed.startsWith('$')) {
    throw new Error(ValidatorErrors.parameterNameStartsWithDollar(node.type, node.lineNumber, trimmed));
  }
};
