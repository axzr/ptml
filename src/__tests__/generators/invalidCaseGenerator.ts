import { buildPTML, buildMinimalExampleContext, wrapInContext, buildNodePTML } from '../../schemaRegistry/ptmlBuilder';
import {
  getDataForNode,
  generateChildPTML,
  getSiblingPTML,
  generateExampleValueForPart,
  getDataPartsForMinData,
  findWrongChildType,
  findWrongPropertyType,
  createConstraintTestNode,
  generateDataWithRestOrSecond,
} from './testCaseHelpers';
import { formatAllowedChildrenForError } from '../../schemaRegistry/formatAllowedChildren';
import { getBlocksList, getSchemaMap } from '../../schemaRegistry/schemaMap';
import { DataFormatErrors, ChildrenErrors, IndentationErrors, RootNodeErrors } from '../../errors/messages';
import type { Node } from '../../types';
import type { NodeSchema } from '../../schemas/types';
import type { GeneratedTestCase, SchemaExampleContext } from '../../schemaRegistry/testCaseTypes';

const VIOLATION_TYPE_WRONG_CHILD_TYPE = 'wrong-child-type';

const generateInvalidCaseDataNotAllowed = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  if (schema.data.allowed !== false) {
    return null;
  }

  if ('requiresSibling' in schema && schema.requiresSibling) {
    return null;
  }

  return {
    name: `${schema.name} with data (not allowed)`,
    description: 'Invalid case: node has data but data is not allowed',
    ptml: buildPTML(schema.name, 'some data', [], context),
    expectedValid: false,
    expectedError: DataFormatErrors.dataNotAllowed(schema.name, 0),
    violationType: 'missing-data',
  };
};

const generateInvalidCaseMissingData = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  if (schema.data.allowed === false || !schema.data.required) {
    return null;
  }

  const partName = schema.data.format?.first?.name ?? 'data';
  const description = schema.data.format?.first?.description;

  return {
    name: `${schema.name} with missing data`,
    description: 'Invalid case: missing required data (note: validator may not catch this yet)',
    ptml: buildPTML(schema.name, '', [], context),
    expectedValid: false,
    expectedError: DataFormatErrors.missingRequiredPart(schema.name, 0, partName, description),
    violationType: 'missing-data',
  };
};

const generateInvalidCaseElseWithoutIf = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  if (!('requiresSibling' in schema) || schema.requiresSibling !== 'if') {
    return null;
  }

  return {
    name: `${schema.name} without preceding if sibling`,
    description: 'Invalid case: else node must have a preceding sibling if node',
    ptml: buildPTML(schema.name, '', [], context),
    expectedValid: false,
    expectedError: ChildrenErrors.elseWithoutIf(0),
    violationType: 'missing-sibling',
  };
};

const generateInvalidCaseMissingRest = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const format = schema.data.format;
  const restPart = format?.rest;

  if (!format?.first || !restPart || !restPart.required) {
    return null;
  }

  const parts: string[] = [];
  if (format.first) {
    parts.push(generateExampleValueForPart(format.first));
  }
  if (format.second) {
    parts.push(generateExampleValueForPart(format.second));
  }
  const dataParts = parts.join(' ');

  return {
    name: `${schema.name} with missing required ${restPart.name} part`,
    description: `Invalid case: missing required ${restPart.name} part`,
    ptml: buildPTML(schema.name, dataParts, [], context),
    expectedValid: false,
    expectedError: DataFormatErrors.missingRequiredPart(schema.name, 0, restPart.name, restPart.description),
    violationType: 'missing-required-part',
  };
};

const getExtraPartForMaxViolation = (format: NonNullable<NodeSchema['data']['format']>): string | null => {
  if (format.second) {
    return generateExampleValueForPart(format.second);
  }
  if (format.first) {
    return generateExampleValueForPart(format.first);
  }
  return null;
};

const getMaxViolationDataParts = (schema: NodeSchema): { dataParts: string; maxParts: number } | null => {
  const maxParts = schema.data.max;
  if (!maxParts || maxParts < 1) return null;
  const format = schema.data.format;
  if (!format) return null;
  if (format.rest) {
    throw new Error(
      `Schema "${schema.name}" has both max constraint (${maxParts}) and format.rest, which is invalid. Rest implies unlimited parts.`,
    );
  }
  const { dataParts: baseDataParts } = getDataPartsForMinData(schema, maxParts);
  const extraPart = getExtraPartForMaxViolation(format);
  if (!extraPart) return null;
  return { dataParts: `${baseDataParts} ${extraPart}`, maxParts };
};

const generateInvalidCaseMaxViolation = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const result = getMaxViolationDataParts(schema);
  if (!result) return null;
  const { dataParts, maxParts } = result;
  return {
    name: `${schema.name} exceeding max data parts`,
    description: `Invalid case: exceeding max ${maxParts} data parts`,
    ptml: buildPTML(schema.name, dataParts, [], context),
    expectedValid: false,
    expectedError: DataFormatErrors.maxPartsExceeded(schema.name, 0, maxParts, maxParts + 1),
    violationType: 'max-parts-violation',
  };
};

const generateWrongChildTypeForNoChildren = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase => {
  const dataForNode = getDataForNode(schema);
  const wrongChildType = findWrongChildType([]);
  const wrongChildPTML = generateChildPTML(wrongChildType, true);
  let ptml: string;

  if ('requiresSibling' in schema && schema.requiresSibling) {
    const siblingPTML = getSiblingPTML(schema);
    const nodePTML = buildPTML(schema.name, dataForNode, [wrongChildPTML], context);
    ptml = wrapInContext(schema.name, `${siblingPTML}\n${nodePTML}`, context);
  } else {
    ptml = buildPTML(schema.name, dataForNode, [wrongChildPTML], context);
  }

  const hasProperties = schema.properties !== undefined;
  const expectedError = hasProperties
    ? ChildrenErrors.wrongChildType(schema.name, 0, wrongChildType, formatAllowedChildrenForError(schema))
    : ChildrenErrors.cannotHaveChildren(schema.name, 0, [wrongChildType]);

  return {
    name: `${schema.name} with wrong child type`,
    description: `Invalid case: ${schema.name} nodes cannot have children`,
    ptml,
    expectedValid: false,
    expectedError,
    violationType: VIOLATION_TYPE_WRONG_CHILD_TYPE,
  };
};

const findWrongBlockType = (allowedBlockTypes: string[]): string => {
  const schemaMap = getSchemaMap();
  const allowedSet = new Set(allowedBlockTypes);

  const preferredBlockTypes = ['box', 'text', 'button', 'each', 'if', 'else', 'show'];
  for (const preferredType of preferredBlockTypes) {
    if (!allowedSet.has(preferredType)) {
      const schema = schemaMap.get(preferredType);
      if (schema && schema.example && schema.category === 'block') {
        return preferredType;
      }
    }
  }

  for (const [name, schema] of schemaMap.entries()) {
    if (!allowedSet.has(name) && schema.example && schema.category === 'block') {
      return name;
    }
  }

  return 'box';
};

const generateWrongBlockType = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase | null => {
  const blocksList = getBlocksList(schema);
  if (blocksList.length === 0) {
    return null;
  }

  const allowedBlockTypes = blocksList.map((b) => b.name);

  if (allowedBlockTypes.length > 10) {
    return null;
  }

  const wrongBlockType = findWrongBlockType(allowedBlockTypes);
  const wrongBlockPTML = generateChildPTML(wrongBlockType, true);
  const dataForNode = getDataForNode(schema);

  return {
    name: `${schema.name} with wrong block child type`,
    description: `Invalid case: block type ${wrongBlockType} not allowed`,
    ptml: buildPTML(schema.name, dataForNode, [wrongBlockPTML], context),
    expectedValid: false,
    expectedError: ChildrenErrors.wrongChildType(schema.name, 0, wrongBlockType, formatAllowedChildrenForError(schema)),
    violationType: VIOLATION_TYPE_WRONG_CHILD_TYPE,
  };
};

const generateWrongPropertyType = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase | null => {
  if (schema.properties?.allowAny) {
    return null;
  }

  if (!schema.properties?.list || schema.properties.list.length === 0) {
    return null;
  }

  const allowedPropertyTypes = schema.properties.list.map((p) => p.name);
  const wrongPropertyType = findWrongPropertyType(allowedPropertyTypes);
  const wrongPropertyPTML = generateChildPTML(wrongPropertyType, false);
  const dataForNode = getDataForNode(schema);

  return {
    name: `${schema.name} with wrong property child type`,
    description: `Invalid case: property type ${wrongPropertyType} not allowed`,
    ptml: buildPTML(schema.name, dataForNode, [wrongPropertyPTML], context),
    expectedValid: false,
    expectedError: ChildrenErrors.wrongChildType(
      schema.name,
      0,
      wrongPropertyType,
      formatAllowedChildrenForError(schema),
    ),
    violationType: VIOLATION_TYPE_WRONG_CHILD_TYPE,
  };
};

const buildContextWithVariables = (context: SchemaExampleContext): SchemaExampleContext => ({
  ...context,
  state: { ...context.state, isActive: 'true', myFunction: 'increment', x: 'value' },
});

const generateConditionalNotAllowed = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase | null => {
  if (schema.conditionals?.allowed === true) {
    return null;
  }
  const allowsIfAsBlock = getBlocksList(schema).some((b) => b.name === 'if');
  if (allowsIfAsBlock) {
    return null;
  }

  const dataForNode = getDataForNode(schema);
  const ifPTML = generateChildPTML('if', true);
  const contextWithState = buildContextWithVariables(context);

  return {
    name: `${schema.name} with conditional child (not allowed)`,
    description: `Invalid case: ${schema.name} does not allow conditional children`,
    ptml: buildPTML(schema.name, dataForNode, [ifPTML], contextWithState),
    expectedValid: false,
    expectedError: ChildrenErrors.wrongChildType(schema.name, 0, 'if', formatAllowedChildrenForError(schema)),
    violationType: VIOLATION_TYPE_WRONG_CHILD_TYPE,
  };
};

const findBlockWithMax = (schema: NodeSchema): { name: string; max: number } | null => {
  for (const block of getBlocksList(schema)) {
    if (block.max !== undefined) {
      return { name: block.name, max: block.max };
    }
  }
  return null;
};

const generateInvalidCaseTooManyBlocks = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const blockWithMax = findBlockWithMax(schema);
  if (!blockWithMax) {
    return null;
  }

  const tooManyBlocks: string[] = [];
  for (let i = 0; i <= blockWithMax.max; i++) {
    tooManyBlocks.push(generateChildPTML(blockWithMax.name, true));
  }

  const minParts = schema.data.min || 1;
  const { dataParts } = getDataPartsForMinData(schema, minParts);

  return {
    name: `${schema.name} with too many ${blockWithMax.name} block children`,
    description: `Invalid case: exceeding max ${blockWithMax.max} block children`,
    ptml: buildPTML(schema.name, dataParts, tooManyBlocks, context),
    expectedValid: false,
    expectedError: ChildrenErrors.tooManyChildren(
      schema.name,
      0,
      blockWithMax.name,
      blockWithMax.max,
      blockWithMax.max + 1,
    ),
    violationType: 'too-many-children',
  };
};

const findPropertyWithMax = (schema: NodeSchema): { name: string; max: number } | null => {
  if (!schema.properties?.list) {
    return null;
  }
  for (const prop of schema.properties.list) {
    if (prop.max !== undefined) {
      return { name: prop.name, max: prop.max };
    }
  }
  return null;
};

const generateInvalidCaseTooManyProperties = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const propertyWithMax = findPropertyWithMax(schema);
  if (!propertyWithMax) {
    return null;
  }

  const tooManyProperties: string[] = [];
  for (let i = 0; i <= propertyWithMax.max; i++) {
    tooManyProperties.push(generateChildPTML(propertyWithMax.name, false));
  }

  const minParts = schema.data.min || 1;
  const { dataParts } = getDataPartsForMinData(schema, minParts);

  return {
    name: `${schema.name} with too many ${propertyWithMax.name} property children`,
    description: `Invalid case: exceeding max ${propertyWithMax.max} property children`,
    ptml: buildPTML(schema.name, dataParts, tooManyProperties, context),
    expectedValid: false,
    expectedError: ChildrenErrors.tooManyChildren(
      schema.name,
      0,
      propertyWithMax.name,
      propertyWithMax.max,
      propertyWithMax.max + 1,
    ),
    violationType: 'too-many-children',
  };
};

const generateConstraintViolationCase = (
  schema: NodeSchema,
  constraint: { description: string; validate: (node: Node) => boolean },
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const testNode = createConstraintTestNode(schema);
  if (constraint.validate(testNode)) {
    return null;
  }

  const minParts = schema.data.min || 1;
  const { dataParts } = getDataPartsForMinData(schema, minParts);

  let children: string[] = [];
  const blocksList = getBlocksList(schema);
  if (blocksList.length > 0) {
    children = [generateChildPTML(blocksList[0].name, true)];
  } else if (schema.properties?.list && schema.properties.list.length > 0) {
    children = [generateChildPTML(schema.properties.list[0].name, false)];
  }

  const violationPTML = buildPTML(schema.name, dataParts, children, context);

  return {
    name: `${schema.name} violating constraint: ${constraint.description}`,
    description: `Invalid case: ${constraint.description}`,
    ptml: violationPTML,
    expectedValid: false,
    expectedError: DataFormatErrors.constraintViolation(schema.name, 0, constraint.description),
    violationType: 'constraint-violation',
  };
};

const generateInvalidCaseConstraintViolations = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase[] => {
  if (!schema.data.constraints) {
    return [];
  }

  return schema.data.constraints
    .map((constraint) => generateConstraintViolationCase(schema, constraint, context))
    .filter((case_): case_ is GeneratedTestCase => case_ !== null);
};

const generateInvalidCaseRootNode = (schema: NodeSchema): GeneratedTestCase | null => {
  if (schema.category === 'declaration') {
    return null;
  }

  const dataForNode = getDataForNode(schema);
  const ptml = buildNodePTML(schema.name, dataForNode, [], true);

  return {
    name: `${schema.name} as root node (not allowed)`,
    description: `Invalid case: ${schema.name} nodes cannot be root nodes`,
    ptml,
    expectedValid: false,
    expectedError: RootNodeErrors.rootMustBeDeclaration(schema.category, schema.name, 1),
    violationType: 'root-node-not-allowed',
  };
};

const generateInvalidCaseConditionalRequirement = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const format = schema.data.format;
  if (!format?.rest) {
    return null;
  }

  const hasRecordProperty = schema.properties?.list?.some((p) => p.name === 'record');

  if (!hasRecordProperty) {
    return null;
  }

  const dataParts = generateDataWithRestOrSecond(schema);
  if (!dataParts) {
    return null;
  }

  const recordChildPTML = generateChildPTML('record', false);

  return {
    name: `${schema.name} with record child but also has value part`,
    description: 'Invalid case: violating conditional requirement - record child should not have value part',
    ptml: buildPTML(schema.name, dataParts, [recordChildPTML], context),
    expectedValid: false,
    expectedError: DataFormatErrors.constraintViolation(schema.name, 0, 'record child should not have value part'),
    violationType: 'conditional-requirement-violation',
  };
};

const generateInvalidCaseChildNodeNotAllowed = (schema: NodeSchema): GeneratedTestCase | null => {
  if (schema.category !== 'declaration') {
    return null;
  }

  const childContext: SchemaExampleContext = { parentNode: 'box' };
  const childPTML = generateChildPTML(schema.name, false);
  const parentPTML = buildPTML('box', '', [childPTML], childContext);

  return {
    name: `${schema.name} as child node (not allowed)`,
    description: `Invalid case: ${schema.name} nodes cannot be child nodes`,
    ptml: parentPTML,
    expectedValid: false,
    expectedError: IndentationErrors.rootNodeIndented(0),
    violationType: 'child-node-not-allowed',
  };
};

const collectInvalidCases = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: (GeneratedTestCase | null)[] = [
    generateInvalidCaseRootNode(schema),
    generateInvalidCaseDataNotAllowed(schema, context),
    generateInvalidCaseMissingData(schema, context),
    generateInvalidCaseMissingRest(schema, context),
    generateInvalidCaseMaxViolation(schema, context),
    generateInvalidCaseElseWithoutIf(schema, context),
  ];

  return cases.filter((testCase) => testCase !== null);
};

const collectChildInvalidCases = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: (GeneratedTestCase | null)[] = [
    generateInvalidCaseTooManyBlocks(schema, context),
    generateInvalidCaseTooManyProperties(schema, context),
    generateWrongBlockType(schema, context),
    generateWrongPropertyType(schema, context),
    generateConditionalNotAllowed(schema, context),
    generateInvalidCaseConditionalRequirement(schema, context),
    generateInvalidCaseChildNodeNotAllowed(schema),
  ];

  const hasBlocks = getBlocksList(schema).length > 0;
  const hasProperties = (schema.properties?.list?.length ?? 0) > 0;
  const hasConditionals = schema.conditionals?.allowed === true;

  if (!hasBlocks && !hasProperties && !hasConditionals) {
    const noChildrenCase = generateWrongChildTypeForNoChildren(schema, context);
    cases.push(noChildrenCase);
  }

  return cases.filter((testCase) => testCase !== null);
};

export const generateInvalidCases = (schema: NodeSchema): GeneratedTestCase[] => {
  const context = buildMinimalExampleContext(schema.name);
  const cases = collectInvalidCases(schema, context);
  const childCases = collectChildInvalidCases(schema, context);
  cases.push(...childCases);
  const constraintCases = generateInvalidCaseConstraintViolations(schema, context);
  cases.push(...constraintCases);
  return cases;
};
