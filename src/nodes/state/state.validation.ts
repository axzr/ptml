import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import type { ChildValidator } from '../../validation/types';
import { stateSchema } from './state.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { validateKeyValue } from '../key-value/key-value.validation';
import { validateStateObject } from '../state-object/state-object.validation';
import { stateArraySchema } from '../state-array/state-array.schema';

const determineStateChildType = (child: Node): 'key-value' | 'state-object' | 'state-array' => {
  if (child.children.length > 0) {
    const hasPropertyChildren = child.children.some((c) => c.category === 'property');
    if (hasPropertyChildren) {
      return 'state-array';
    }
    return 'state-object';
  }
  return 'key-value';
};

const stateChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  const childType = determineStateChildType(child);

  if (childType === 'key-value') {
    validateKeyValue(child, context);
  } else if (childType === 'state-object') {
    validateStateObject(child, context);
  } else if (childType === 'state-array') {
    validateNodeData(stateArraySchema, child, context);

    child.children.forEach((grandchild) => {
      stateChildValidator(grandchild, context);
    });
  }
};

export const validateState = (node: Node, context: ValidationContext): void => {
  validateNodeData(stateSchema, node, context);
  validateMinimumChildren(node, stateSchema);

  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, stateSchema, context, stateChildValidator);
  } finally {
    context.stack.pop();
  }
};
