import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import type { ChildValidator } from '../../validation/types';
import { validateIfPropertyInStyles } from '../styles/stylesChildValidator';
import { validateElsePropertyInStyles } from '../styles/stylesChildValidator';
import { HierarchyErrors } from '../../errors/messages';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';
import { validateNodeAgainstSchema } from '../../validation/validators/validateNode';

const validateConditionalChild = (child: Node, context: ValidationContext): void => {
  if (child.type === 'if') {
    validateIfPropertyInStyles(child, context);
  } else if (child.type === 'else') {
    validateElsePropertyInStyles(child, context);
  } else {
    validateNodeAgainstSchema(child, context);
  }
};

export const defineChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category === 'block') {
    validateNodeAgainstSchema(child, context);
  } else if (child.category === 'property') {
    validatePropertyNodeAgainstSchema(child, context);
  } else if (child.category === 'conditional') {
    validateConditionalChild(child, context);
  } else if (child.category === 'action') {
    validateNodeAgainstSchema(child, context);
  } else {
    throw new Error(HierarchyErrors.defineCannotContain(child.category, child.type, child.lineNumber));
  }
};
