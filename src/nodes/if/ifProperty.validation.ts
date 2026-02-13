import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import {
  validateConditional,
  conditionalChildValidatorForProperty,
} from '../../validation/validators/validateConditional';

export const validateIfProperty = (node: Node, context: ValidationContext): void => {
  validateConditional(node, context, conditionalChildValidatorForProperty);
};
