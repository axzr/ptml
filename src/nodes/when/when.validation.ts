import type { Node } from '../../types';
import type { ValidationContext, ChildValidator } from '../../validation/types';
import { whenSchema } from './when.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';
import { HierarchyErrors, InteractionErrors } from '../../errors/messages';

const whenChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category !== 'property') {
    throw new Error(HierarchyErrors.blockCannotContain(child.category, child.type, child.lineNumber));
  }
  validatePropertyNodeAgainstSchema(child, context);
};

export const validateWhen = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'block') {
    return;
  }

  // The rule is attached to the class generated for a named style, so there has
  // to be a named style. Inline styles have nothing to hang it off.
  if (context.parentType !== 'define') {
    throw new Error(InteractionErrors.whenOutsideDefine(node.lineNumber));
  }

  validateNodeData(whenSchema, node, context);
  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, whenSchema, context, whenChildValidator);
  } finally {
    context.stack.pop();
  }
};
