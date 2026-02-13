import type { Node } from '../../types';
import type { ChildValidator, ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { ValidationErrors } from '../../errors/messages';
import { blockChildValidator } from '../../categories/block/block.validation';
import { validateRowRole } from '../../dataTypes/rowRole/rowRole.validation';

export const validateRoleProperty = (child: Node): void => {
  const value = (child.data ?? '').trim();
  validateRowRole(value, child);
};

const rowChildValidator: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.type === 'role') {
    validateRoleProperty(child);
    return;
  }
  blockChildValidator(child, context);
};

export const validateRow = (node: Node, context: ValidationContext): void => {
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
  validateNodeChildrenInternal(node, schema, context, rowChildValidator);
};
