import type { Node } from '../../types';
import type { NodeSchema } from '../../schemas/types';
import type { ValidationContext, SemanticStackEntry, ChildValidator } from '../types';
import { ChildrenErrors } from '../../errors/messages';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getBlocksList, getSchemaMap } from '../../schemaRegistry/schemaMap';

const validateElseNodeSibling = (child: Node, previousChild: Node | undefined): void => {
  const schemaMap = getSchemaMap();
  const childSchema = schemaMap.get(child.type);
  if (!childSchema || childSchema.category !== 'conditional' || !childSchema.requiresSibling) {
    return;
  }

  const requiredSiblingType = childSchema.requiresSibling;
  if (!requiredSiblingType) {
    return;
  }

  const hasPrecedingRequiredSibling = previousChild?.type === requiredSiblingType;
  if (!hasPrecedingRequiredSibling) {
    throw new Error(ChildrenErrors.elseWithoutIf(child.lineNumber));
  }
};

const validateChildTypeAgainstSet = (
  child: Node,
  node: Node,
  allowedChildren: Set<string>,
  allowedChildrenStr: string,
): void => {
  if (!allowedChildren.has(child.type)) {
    throw new Error(ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, allowedChildrenStr));
  }
};

const collectRequiredChildren = (schema: NodeSchema): string[] => {
  const requiredBlocks: string[] = [];
  const requiredProperties: string[] = [];

  requiredBlocks.push(
    ...getBlocksList(schema)
      .filter((b) => b.required)
      .map((b) => b.name),
  );
  if (schema.properties?.list) {
    requiredProperties.push(...schema.properties.list.filter((p) => p.required).map((p) => p.name));
  }

  return [...requiredBlocks, ...requiredProperties];
};

export const validateMinimumChildren = (node: Node, schema: NodeSchema): void => {
  const allRequired = collectRequiredChildren(schema);
  if (node.children.length === 0 && allRequired.length > 0) {
    throw new Error(ChildrenErrors.minimumChildrenRequired(node.type, node.lineNumber, allRequired));
  }
};

const validateNoRepeats = (child: Node, node: Node, seenChildTypes: Map<string, number>): void => {
  if (seenChildTypes.has(child.type)) {
    const firstOccurrence = seenChildTypes.get(child.type);
    throw new Error(
      ChildrenErrors.duplicateChildType(node.type, node.lineNumber, child.type, child.lineNumber, firstOccurrence!),
    );
  }
  seenChildTypes.set(child.type, child.lineNumber);
};

const validateChildNotEmpty = (child: Node, node: Node): void => {
  if (!child.type || child.type.trim() === '') {
    throw new Error(ChildrenErrors.emptyChildType(node.type, node.lineNumber, child.lineNumber));
  }
};

const validateConditionalChild = (child: Node, node: Node, schema: NodeSchema): void => {
  const allowedBlocks = getAllowedBlocksForNode(schema);
  const isAllowedAsBlock = allowedBlocks.size > 0 && allowedBlocks.has(child.type);
  if (isAllowedAsBlock) {
    return;
  }
  if (!areConditionalsAllowed(schema)) {
    throw new Error(
      ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, formatAllowedChildrenForError(schema)),
    );
  }
};

const validateBlockChild = (child: Node, node: Node, schema: NodeSchema): void => {
  const allowedBlocks = getAllowedBlocksForNode(schema);
  if (allowedBlocks.size > 0) {
    validateChildTypeAgainstSet(child, node, allowedBlocks, formatAllowedChildrenForError(schema));
  } else {
    throw new Error(
      ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, formatAllowedChildrenForError(schema)),
    );
  }
};

const validatePropertyChild = (child: Node, node: Node, schema: NodeSchema): void => {
  const allowedProperties = getAllowedPropertiesForNode(schema);
  if (allowedProperties === null) {
    return;
  }
  if (allowedProperties.size > 0) {
    validateChildTypeAgainstSet(child, node, allowedProperties, formatAllowedChildrenForError(schema));
    return;
  }
  throw new Error(
    ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, formatAllowedChildrenForError(schema)),
  );
};

const checkActionsAllowed = (child: Node, node: Node, schema: NodeSchema): void => {
  const allowsActions = node.category === 'action' || areActionsAllowed(schema);
  if (!allowsActions) {
    throw new Error(
      ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, formatAllowedChildrenForError(schema)),
    );
  }
  const allowedTypes = schema.actions?.allowedTypes;
  if (allowedTypes !== undefined && allowedTypes.length > 0 && !allowedTypes.includes(child.type)) {
    throw new Error(
      ChildrenErrors.wrongChildType(node.type, node.lineNumber, child.type, formatAllowedChildrenForError(schema)),
    );
  }
};

const validateChildType = (child: Node, node: Node, schema: NodeSchema): void => {
  const validators: Record<string, (child: Node, node: Node, schema: NodeSchema) => void> = {
    conditional: validateConditionalChild,
    block: validateBlockChild,
    property: validatePropertyChild,
    action: checkActionsAllowed,
  };

  const validator = validators[child.category];
  if (validator) {
    validator(child, node, schema);
  }
};

const validateChildMaxCount = (child: Node, node: Node, schema: NodeSchema, childCounts: Map<string, number>): void => {
  let maxCount: number | undefined;

  if (child.category === 'block' && schema.blocks) {
    const blockDef = getBlocksList(schema).find((b) => b.name === child.type);
    maxCount = blockDef?.max;
  } else if (child.category === 'property' && schema.properties?.list) {
    const propDef = schema.properties.list.find((p) => p.name === child.type);
    maxCount = propDef?.max;
  }

  if (maxCount !== undefined) {
    const currentCount = (childCounts.get(child.type) || 0) + 1;
    childCounts.set(child.type, currentCount);
    if (currentCount > maxCount) {
      throw new Error(ChildrenErrors.tooManyChildren(node.type, node.lineNumber, child.type, maxCount, currentCount));
    }
  }
};

const getAllowedBlocksForNode = (schema: NodeSchema): Set<string> =>
  new Set(getBlocksList(schema).map((block) => block.name));

const getAllowedPropertiesForNode = (schema: NodeSchema): Set<string> | null => {
  if (!schema.properties) {
    return null;
  }
  if (schema.properties.allowAny) {
    return null;
  }
  if (schema.properties.list) {
    return new Set(schema.properties.list.map((prop) => prop.name));
  }
  return null;
};

const areConditionalsAllowed = (schema: NodeSchema): boolean => {
  return schema.conditionals?.allowed === true;
};

const areActionsAllowed = (schema: NodeSchema): boolean => {
  return schema.actions?.allowAny === true || (schema.actions?.allowedTypes?.length ?? 0) > 0;
};

const createStackEntry = (child: Node): SemanticStackEntry => {
  return { type: child.type };
};

const validateNoRepeatsIfRequired = (
  child: Node,
  node: Node,
  schema: NodeSchema,
  seenChildTypes: Map<string, number>,
): void => {
  const hasNoRepeatsBlocks = schema.blocks?.noRepeats === true;
  const hasNoRepeatsProperties = schema.properties?.list && schema.properties.noRepeats === true;
  const isPropertyChild = child.category === 'property';
  if (hasNoRepeatsBlocks || (hasNoRepeatsProperties && isPropertyChild)) {
    validateNoRepeats(child, node, seenChildTypes);
  }
};

const validateCanHaveChildren = (node: Node, schema: NodeSchema): void => {
  const hasBlocks = getBlocksList(schema).length > 0;
  const hasProperties = schema.properties !== undefined;
  const hasConditionals = areConditionalsAllowed(schema);
  const hasActions = areActionsAllowed(schema);

  if (!hasBlocks && !hasProperties && !hasConditionals && !hasActions) {
    throw new Error(
      ChildrenErrors.cannotHaveChildren(
        node.type,
        node.lineNumber,
        node.children.map((c) => c.type),
      ),
    );
  }
};

type ChildIterationState = {
  childCounts: Map<string, number>;
  seenChildTypes: Map<string, number>;
  previousChild: Node | undefined;
};

const validateSingleChild = (
  child: Node,
  node: Node,
  schema: NodeSchema,
  context: ValidationContext,
  validateChildNode: ChildValidator,
  iterationState: ChildIterationState,
): void => {
  validateChildNotEmpty(child, node);
  validateChildType(child, node, schema);
  validateChildMaxCount(child, node, schema, iterationState.childCounts);
  validateNoRepeatsIfRequired(child, node, schema, iterationState.seenChildTypes);
  validateElseNodeSibling(child, iterationState.previousChild);

  const stackEntry = createStackEntry(child);
  context.stack.push(stackEntry);
  try {
    validateChildNode(child, context);
  } finally {
    context.stack.pop();
  }

  iterationState.previousChild = child;
};

export const validateNodeChildrenInternal = (
  node: Node,
  schema: NodeSchema,
  context: ValidationContext,
  validateChildNode: ChildValidator,
): void => {
  if (node.children.length === 0) {
    return;
  }

  validateCanHaveChildren(node, schema);

  const iterationState: ChildIterationState = {
    childCounts: new Map<string, number>(),
    seenChildTypes: new Map<string, number>(),
    previousChild: undefined,
  };

  const previousParentType = context.parentType;
  context.parentType = node.type;

  try {
    for (const child of node.children) {
      validateSingleChild(child, node, schema, context, validateChildNode, iterationState);
    }
  } finally {
    context.parentType = previousParentType;
  }
};
