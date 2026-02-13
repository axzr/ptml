import type { Node } from '../../types';
import type { ValidationContext, SemanticStackEntry } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { stylesChildValidator } from './stylesChildValidator';
import { ValidationErrors } from '../../errors/messages';

export const validateStyles = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'property') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('property', node.type, node.lineNumber));
  }

  if (schema.category !== 'property') {
    throw new Error(ValidationErrors.notPropertyNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);
  const stackEntry: SemanticStackEntry = { type: node.type };
  context.stack.push(stackEntry);
  try {
    validateNodeChildrenInternal(node, schema, context, stylesChildValidator);
  } finally {
    context.stack.pop();
  }
};
