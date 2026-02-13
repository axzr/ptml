import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { getBlocksList, getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal, validateMinimumChildren } from '../../validation/validators/validateChildren';
import { HierarchyErrors, ValidationErrors } from '../../errors/messages';
import type { NodeSchema } from '../../schemas/types';
import { validateNodeAgainstSchema } from '../../validation/validators/validateNode';

const getAllowedChildTypesSet = (schema: NodeSchema): Set<string> => {
  const allowedChildren: string[] = [];
  allowedChildren.push(...getBlocksList(schema).map((b) => b.name));
  if (schema.properties?.list) {
    allowedChildren.push(...schema.properties.list.map((p) => p.name));
  }
  return new Set(allowedChildren);
};

const propertyAllowsActions = (schema: NodeSchema): boolean =>
  schema.actions?.allowAny === true || (schema.actions?.allowedTypes?.length ?? 0) > 0;

const validateActionChildInProperty = (child: Node, context: ValidationContext, propertySchema: NodeSchema): void => {
  if (propertyAllowsActions(propertySchema)) {
    validateNodeAgainstSchema(child, context);
    return;
  }
  const allowedChildren = getAllowedChildTypesSet(propertySchema);
  const isAllowed = allowedChildren.has(child.type);
  if (!isAllowed) {
    throw new Error(HierarchyErrors.propertyCannotContain(child.category, child.type, child.lineNumber));
  }
  validateNodeAgainstSchema(child, context);
};

const validateBlockChildInProperty = (child: Node, _context: ValidationContext, propertySchema: NodeSchema): void => {
  const allowedChildren = getAllowedChildTypesSet(propertySchema);
  const isAllowed = allowedChildren.has(child.type);
  if (!isAllowed) {
    throw new Error(HierarchyErrors.propertyCannotContain(child.category, child.type, child.lineNumber));
  }
};

const validatePropertyChildWithSchema = (child: Node, context: ValidationContext, propertySchema: NodeSchema): void => {
  if (child.category === 'action') {
    validateActionChildInProperty(child, context, propertySchema);
    return;
  }

  if (child.category === 'block') {
    validateBlockChildInProperty(child, context, propertySchema);
    return;
  }

  if (child.category === 'property') {
    validatePropertyNodeAgainstSchema(child, context);
  } else if (child.category === 'conditional') {
    validateNodeAgainstSchema(child, context);
  }
};

export const validatePropertyDefault = (node: Node, context: ValidationContext): void => {
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
  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, schema, context, (child, context) => {
      validatePropertyChildWithSchema(child, context, schema);
    });
  } finally {
    context.stack.pop();
  }
};

export const validatePropertyNodeAgainstSchema = (node: Node, context: ValidationContext): void => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);
  if (!schema) {
    return;
  }
  if (!schema.functions.validate) {
    throw new Error(ValidationErrors.unknownNodeType('property', node.type, node.lineNumber));
  }
  schema.functions.validate(node, context);
};
