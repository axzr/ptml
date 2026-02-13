import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import type { ChildValidator } from '../../validation/types';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { HierarchyErrors, ValidationErrors } from '../../errors/messages';
import { validatePropertyNodeAgainstSchema } from '../property/property.validation';
import { validateNodeAgainstSchema } from '../../validation/validators/validateNode';

const actionChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category === 'action') {
    validateNodeAgainstSchema(child, context);
  } else if (child.category === 'property') {
    validatePropertyNodeAgainstSchema(child, context);
  } else {
    throw new Error(HierarchyErrors.actionCanOnlyContain(child.type, child.category, child.lineNumber));
  }
};

export const validateActionDefault = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'action') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('action', node.type, node.lineNumber));
  }

  if (schema.category !== 'action') {
    throw new Error(ValidationErrors.notActionNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);
  validateNodeChildrenInternal(node, schema, context, actionChildValidator);
};
