import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { validateChildNode } from '../../validation/validators/validateNode';
import { ValidationErrors } from '../../errors/messages';

export const validateDeclarationDefault = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'declaration') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('declaration', node.type, node.lineNumber));
  }

  if (schema.category !== 'declaration') {
    throw new Error(ValidationErrors.notDeclarationNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);
  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, schema, context, validateChildNode);
  } finally {
    context.stack.pop();
  }
};
