import type { Node } from '../../types';
import type { ValidationContext, SemanticStackEntry } from '../../validation/types';
import { templateSchema } from './template.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';

export const validateTemplate = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'declaration') {
    return;
  }
  validateNodeData(templateSchema, node, context);
  validateMinimumChildren(node, templateSchema);
  const stackEntry: SemanticStackEntry = { type: node.type };
  if (node.data) {
    const parts = node.data.trim().split(/\s+/);
    stackEntry.templateParameters = parts.slice(1);
  }
  context.stack.push(stackEntry);
  try {
    validateNodeChildrenInternal(node, templateSchema, context, blockChildValidator);
  } finally {
    context.stack.pop();
  }
};
