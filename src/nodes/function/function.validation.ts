import type { Node } from '../../types';
import type { ValidationContext, SemanticStackEntry } from '../../validation/types';
import { functionSchema } from './function.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateChildNode } from '../../validation/validators/validateNode';

export const validateFunction = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'declaration') {
    return;
  }
  validateNodeData(functionSchema, node, context);
  const stackEntry: SemanticStackEntry = { type: node.type };
  if (node.data) {
    const parts = node.data.trim().split(/\s+/);
    stackEntry.functionParameters = parts.slice(1);
  }
  context.stack.push(stackEntry);

  try {
    validateNodeChildrenInternal(node, functionSchema, context, validateChildNode);
  } finally {
    context.stack.pop();
  }
};
