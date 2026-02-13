import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import type { ChildValidator } from '../../validation/types';
import { BreakpointsErrors, HierarchyErrors, ValidationErrors } from '../../errors/messages';
import {
  validateConditional,
  conditionalChildValidatorForProperty,
} from '../../validation/validators/validateConditional';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';

export const validateIfPropertyInStyles = (node: Node, context: ValidationContext): void => {
  validateConditional(node, context, conditionalChildValidatorForProperty);
};

export const validateElsePropertyInStyles = (node: Node, context: ValidationContext): void => {
  validateConditional(node, context, conditionalChildValidatorForProperty);
};

export const stylesChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.type === 'breakpoint') {
    throw new Error(BreakpointsErrors.stylesCannotContainBreakpoint(child.lineNumber ?? 0));
  }
  if (child.category === 'conditional') {
    if (child.type === 'if') {
      validateIfPropertyInStyles(child, context);
    } else if (child.type === 'else') {
      validateElsePropertyInStyles(child, context);
    } else {
      throw new Error(ValidationErrors.unknownNodeType('conditional', child.type, child.lineNumber));
    }
  } else if (child.category === 'property') {
    validatePropertyNodeAgainstSchema(child, context);
  } else {
    throw new Error(HierarchyErrors.propertyCannotContain(child.category, child.type, child.lineNumber));
  }
};
