import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validatePipeFunctions } from '../../validation/validators/helpers';
import { validatePipeExpression } from '../../validation/validators/validatePipe';

export const validatePipeExpressionValue = (value: string, node: Node, context?: ValidationContext): void => {
  if (!value || !value.trim()) {
    return;
  }

  validatePipeFunctions(value, node.lineNumber, node.type);

  if (!context) {
    return;
  }

  validatePipeExpression(value, node, context);
};
