import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { breakpointSchema } from './breakpoint.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { getBreakpointChildValidator } from './breakpointChildValidator';

function getParentType(context: ValidationContext): string {
  return context.parentType ?? '';
}

export const validateBreakpoint = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'block') {
    return;
  }
  validateNodeData(breakpointSchema, node, context);
  const parentType = getParentType(context);
  const childValidator = getBreakpointChildValidator(parentType);
  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, breakpointSchema, context, childValidator);
  } finally {
    context.stack.pop();
  }
};
