import type { Node } from '../../types';
import type { ChildValidator, ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { ValidationErrors } from '../../errors/messages';
import { validateNodeAgainstSchema } from '../../validation/validators/validateNode';
import { validatePropertyNodeAgainstSchema } from '../property/property.validation';

export const validateBlockDefault = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'block') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('block', node.type, node.lineNumber));
  }

  if (schema.category !== 'block') {
    throw new Error(ValidationErrors.notBlockNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);
  validateNodeChildrenInternal(node, schema, context, blockChildValidator);
};

export const blockChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  switch (child.category) {
    case 'block':
    case 'conditional':
    case 'action':
      return validateNodeAgainstSchema(child, context);
    case 'property':
      return validatePropertyNodeAgainstSchema(child, context);
    default:
      throw new Error(ValidationErrors.unknownCategory(child.category, child.type, child.lineNumber));
  }
};
