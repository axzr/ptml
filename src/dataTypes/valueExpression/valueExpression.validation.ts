import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validatePipeFunctions, validateValueExpressionVariables } from '../../validation/validators/helpers';

export const validateValueExpressionValue = (value: string, node: Node, context?: ValidationContext): void => {
  if (!value || !value.trim()) {
    return;
  }

  if (context) {
    validatePipeFunctions(value, node.lineNumber, node.type);
    validateValueExpressionVariables(value, node, context, node.type);
  }
};
