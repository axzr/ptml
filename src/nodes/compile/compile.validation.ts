import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { compileSchema } from './compile.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';

export const validateCompile = (node: Node, context: ValidationContext): void => {
  validateMinimumChildren(node, compileSchema);
  validateNodeData(compileSchema, node, context);

  if (node.children.length > 0) {
    validateNodeChildrenInternal(node, compileSchema, context, blockChildValidator);
  }
};
