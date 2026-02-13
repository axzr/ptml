import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validateConditional, conditionalChildValidatorInBlock } from '../../validation/validators/validateConditional';

export const validateElseBlock = (node: Node, context: ValidationContext): void => {
  validateConditional(node, context, conditionalChildValidatorInBlock);
};
