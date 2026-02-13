import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { ChildrenErrors } from '../../errors/messages';
import { keyValueSchema } from './key-value.schema';

export const validateKeyValue = (node: Node, context: ValidationContext): void => {
  validateNodeData(keyValueSchema, node, context);

  if (node.children.length > 0) {
    throw new Error(
      ChildrenErrors.cannotHaveChildren(
        node.type,
        node.lineNumber,
        node.children.map((c) => c.type),
      ),
    );
  }
};
