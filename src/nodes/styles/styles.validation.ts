import type { Node } from '../../types';
import type { ValidationContext, SemanticStackEntry } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { stylesChildValidator } from './stylesChildValidator';
import { StylesErrors, ValidationErrors } from '../../errors/messages';

export const validateStyles = (node: Node, context: ValidationContext): void => {
  // styles is a property node. Written as "> styles:" it parses as a block and
  // returning here used to skip every check below it -- unknown CSS properties
  // and breakpoint children alike -- while the renderer ignored the node
  // entirely, so the styles simply never applied and nothing said so.
  if (node.category !== 'property') {
    throw new Error(StylesErrors.stylesMustUsePropertyPrefix(node.lineNumber));
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
