import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ValidatorErrors } from '../../errors/messages';
import { validateIndexExpression } from '../../validation/validators/helpers';

export const validateIndexExpressionValue = (value: string, node: Node, context?: ValidationContext): void => {
  if (context) {
    validateIndexExpression(value, node, context, node.type);
  } else {
    const trimmed = value.trim();
    if (!trimmed.startsWith('$')) {
      const numericIndex = Number(trimmed);
      if (isNaN(numericIndex) || numericIndex < 0) {
        throw new Error(ValidatorErrors.invalidIndex(node.type, node.lineNumber, trimmed));
      }
    }
  }
};
