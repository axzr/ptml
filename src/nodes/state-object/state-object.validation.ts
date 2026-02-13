import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { stateObjectSchema } from './state-object.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateKeyValue } from '../key-value/key-value.validation';
import type { ChildValidator } from '../../validation/types';

const stateObjectChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.type === 'state-object') {
    validateStateObject(child, context);
  } else if (child.type === 'key-value') {
    validateKeyValue(child, context);
  }
};

export const validateStateObject = (node: Node, context: ValidationContext): void => {
  validateNodeData(stateObjectSchema, node, context);

  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, stateObjectSchema, context, stateObjectChildValidator);
  } finally {
    context.stack.pop();
  }
};
