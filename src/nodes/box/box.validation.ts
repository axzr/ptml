import type { Node } from '../../types';
import type { ChildValidator, ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { ValidationErrors } from '../../errors/messages';
import { blockChildValidator } from '../../categories/block/block.validation';
import { validateBoxRole } from '../../dataTypes/boxRole/boxRole.validation';

export const validateRoleProperty = (child: Node): void => {
  const value = (child.data ?? '').trim();
  validateBoxRole(value, child);
};

const boxChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.type === 'role') {
    validateRoleProperty(child);
    return;
  }
  blockChildValidator(child, context);
};

export const validateBox = (node: Node, context: ValidationContext): void => {
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
  validateNodeChildrenInternal(node, schema, context, boxChildValidator);
};
