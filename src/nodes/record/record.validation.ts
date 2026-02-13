import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { recordSchema } from './record.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateKeyValue } from '../key-value/key-value.validation';

export const validateRecord = (node: Node, context: ValidationContext): void => {
  validateNodeData(recordSchema, node, context);

  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, recordSchema, context, validateKeyValue);
  } finally {
    context.stack.pop();
  }
};
