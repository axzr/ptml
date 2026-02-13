import type { Node } from '../../types';
import type { ValidationContext } from '../types';
import type { NodeSchema } from '../../schemas/types';
import type { ChildValidator } from '../types';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from './validateNodeData';
import { validateNodeChildrenInternal } from './validateChildren';
import { validateMinimumChildren } from './validateChildren';
import { HierarchyErrors, ValidationErrors, ChildrenErrors } from '../../errors/messages';
import { validatePropertyNodeAgainstSchema } from '../../categories/property/property.validation';
import { validateNodeAgainstSchema } from './validateNode';

export const validateConditional = (
  node: Node,
  context: ValidationContext,
  childValidator: ChildValidator,
  schemaModifier?: (schema: NodeSchema) => NodeSchema,
): void => {
  if (node.category !== 'conditional') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('conditional', node.type, node.lineNumber));
  }

  if (schema.category !== 'conditional') {
    throw new Error(ValidationErrors.notConditionalNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);
  const finalSchema = schemaModifier ? schemaModifier(schema) : schema;
  validateNodeChildrenInternal(node, finalSchema, context, childValidator);
};

const validateConditionalChild = (child: Node, context: ValidationContext, childValidator: ChildValidator): void => {
  if (child.category === 'conditional') {
    validateConditional(child, context, childValidator);
  } else {
    validateNodeAgainstSchema(child, context);
  }
};

export const conditionalChildValidatorInBlock: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category === 'block') {
    validateNodeAgainstSchema(child, context);
  } else if (child.category === 'property') {
    const schemaMap = getSchemaMap();
    const schema = schemaMap.get(child.type);
    if (!schema || !schema.functions.validate) {
      const ifSchema = getSchemaMap().get('if');
      throw new Error(
        ChildrenErrors.wrongChildType(
          'if',
          child.lineNumber,
          child.type,
          ifSchema ? formatAllowedChildrenForError(ifSchema) : 'none',
        ),
      );
    }
    validatePropertyNodeAgainstSchema(child, context);
  } else if (child.category === 'conditional') {
    validateConditionalChild(child, context, conditionalChildValidatorInBlock);
  } else if (child.category === 'action') {
    validateNodeAgainstSchema(child, context);
  } else {
    throw new Error(HierarchyErrors.conditionalInBlockCannotContain(child.category, child.type, child.lineNumber));
  }
};

export const conditionalChildValidatorForProperty: ChildValidator = (child: Node, context: ValidationContext): void => {
  if (child.category === 'block' || child.category === 'action') {
    throw new Error(HierarchyErrors.conditionalInPropertyCannotContain(child.category, child.type, child.lineNumber));
  }

  if (child.category === 'property') {
    validatePropertyNodeAgainstSchema(child, context);
  } else if (child.category === 'conditional') {
    validateConditionalChild(child, context, conditionalChildValidatorForProperty);
  }
};
