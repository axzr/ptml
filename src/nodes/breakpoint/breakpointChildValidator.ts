import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import type { ChildValidator } from '../../validation/types';
import { HierarchyErrors } from '../../errors/messages';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';
import { validateChildNode } from '../../validation/validators/validateNode';

export const getBreakpointChildValidator = (parentType: string): ChildValidator => {
  return (child: Node, context: ValidationContext): void => {
    if (parentType === 'define') {
      if (child.category !== 'property') {
        throw new Error(HierarchyErrors.blockCannotContain(child.category, child.type, child.lineNumber ?? 0));
      }
      validatePropertyNodeAgainstSchema(child, context);
    } else {
      validateChildNode(child, context);
    }
  };
};
