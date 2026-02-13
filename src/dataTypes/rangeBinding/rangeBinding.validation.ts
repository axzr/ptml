import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';
import { matchListBinding } from '../../utils/regexPatterns';

export const validateRangeBinding = (value: string, node: Node): void => {
  const trimmed = value.trim();
  const binding = matchListBinding(trimmed);

  if (!binding) {
    throw new Error(ValidatorErrors.rangeBindingFormat(node.lineNumber));
  }

  const variableName = binding.variableName;

  if (!variableName.startsWith('$')) {
    throw new Error(ValidatorErrors.rangeVariableName(node.lineNumber, variableName));
  }

  if (variableName.includes(' ')) {
    throw new Error(ValidatorErrors.rangeInvalidSyntax(node.lineNumber, variableName));
  }
};
