import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { showSchema } from './show.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';

export const validateShow = (node: Node, context: ValidationContext): void => {
  validateMinimumChildren(node, showSchema);
  if (node.children.length > 0) {
    validateNodeChildrenInternal(node, showSchema, context, blockChildValidator);
  }
  validateNodeData(showSchema, node, context);
};
