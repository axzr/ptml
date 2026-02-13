import type { Node } from '../../types';
import type { ValidationContext, SemanticStackEntry } from '../../validation/types';
import { defineSchema } from './define.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { defineChildValidator } from './defineChildValidator';

export const validateDefine = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'declaration') {
    return;
  }
  validateNodeData(defineSchema, node, context);
  const stackEntry: SemanticStackEntry = { type: node.type };
  context.stack.push(stackEntry);

  try {
    validateNodeChildrenInternal(node, defineSchema, context, defineChildValidator);
  } finally {
    context.stack.pop();
  }
};
