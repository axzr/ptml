import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import type { ChildValidator } from '../../validation/types';
import { BreakpointsErrors } from '../../errors/messages';
import { ValidatorErrors } from '../../errors/messages';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';

const LABEL_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;

export const breakpointsChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category !== 'property') {
    throw new Error(BreakpointsErrors.breakpointsCannotContain(child.category, child.type, child.lineNumber ?? 0));
  }
  const label = (child.type ?? '').trim();
  if (!label) {
    throw new Error(
      ValidatorErrors.breakpointsChildWidthInvalid('breakpoints', child.lineNumber ?? 0, '(missing)', child.data ?? ''),
    );
  }
  if (!LABEL_REGEX.test(label)) {
    throw new Error(
      ValidatorErrors.breakpointsChildWidthInvalid('breakpoints', child.lineNumber ?? 0, label, child.data ?? ''),
    );
  }
  validatePropertyNodeAgainstSchema(child, context);
};
