import type { NodeSchema } from '../../schemas/types';
import type { GeneratedTestCase, SchemaExampleContext } from '../../schemaRegistry/testCaseTypes';
import { buildPTML, buildMinimalExampleContext, buildNodePTML, wrapInContext } from '../../schemaRegistry/ptmlBuilder';
import {
  findOptionalBlockChild,
  getDataForNode,
  generateChildPTML,
  getSiblingPTML,
  needsChildForMinParts,
  adjustDataPartsForConstraints,
  getDataPartsForMinData,
  createTestNodeFromPTML,
  validateConstraints,
  generateExampleValueForPart,
  getPrefixForCategory,
} from './testCaseHelpers';
import { getBlocksList, getSchemaMap } from '../../schemaRegistry/schemaMap';
import { removeCategoryPrefix } from '../../utils/regexPatterns';

const addOptionalChildForMinParts = (schema: NodeSchema, dataParts: string, children: string[]): void => {
  if (!needsChildForMinParts(schema, dataParts)) {
    return;
  }

  const optionalChild = findOptionalBlockChild(schema);
  if (optionalChild) {
    const isBlock = getBlocksList(schema).some((b) => b.name === optionalChild.name);
    const childPTML = generateChildPTML(optionalChild.name, isBlock);
    children.push(childPTML);
  }
};

const generateValidCaseWithRest = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase | null => {
  const restOrSecond = schema.data.format?.rest || schema.data.format?.second;
  if (!restOrSecond || !restOrSecond.required) {
    return null;
  }

  const dataForRest = getDataForNode(schema);
  const children = generateRequiredChildren(schema);
  addOptionalChildForMinParts(schema, dataForRest, children);

  return {
    name: `${schema.name} with list name and value`,
    description: 'Valid case with required data parts',
    ptml: buildPTML(schema.name, dataForRest, children, context),
    expectedValid: true,
  };
};

const findValidOptionalChild = (schema: NodeSchema): { name: string; max?: number } | null => {
  const optionalChild = findOptionalBlockChild(schema);
  if (!optionalChild || (optionalChild.max || 1) < 1) {
    return null;
  }
  return optionalChild;
};

const buildOptionalChildCase = (
  schema: NodeSchema,
  optionalChildName: string,
  dataParts: string,
  context: SchemaExampleContext,
): GeneratedTestCase => {
  const finalDataParts = adjustDataPartsForConstraints(schema, dataParts, optionalChildName);
  const isBlock = getBlocksList(schema).some((b) => b.name === optionalChildName);
  const requiredChildren = generateRequiredChildren(schema);
  const optionalChildPTML = generateChildPTML(optionalChildName, isBlock);
  const allChildren = [...requiredChildren, optionalChildPTML];

  return {
    name: `${schema.name} with ${optionalChildName} child`,
    description: `Valid case with optional ${optionalChildName} child`,
    ptml: buildPTML(schema.name, finalDataParts, allChildren, context),
    expectedValid: true,
  };
};

const generateValidCaseWithOptionalChild = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const hasBlocks = getBlocksList(schema).length > 0;
  const hasProperties = (schema.properties?.list?.length ?? 0) > 0;
  if (!hasBlocks && !hasProperties) {
    return null;
  }

  const optionalChild = findValidOptionalChild(schema);
  if (!optionalChild) {
    return null;
  }

  const dataParts = getDataForNode(schema);
  return buildOptionalChildCase(schema, optionalChild.name, dataParts, context);
};

const buildConditionalRequirementPTML = (
  schema: NodeSchema,
  optionalChildName: string,
  context: SchemaExampleContext,
): string => {
  const format = schema.data.format;
  const isBlock = getBlocksList(schema).some((b) => b.name === optionalChildName);
  const requiredChildren = generateRequiredChildren(schema);
  const optionalChildPTML = generateChildPTML(optionalChildName, isBlock);
  const allChildren = [...requiredChildren, optionalChildPTML];
  if (!format?.first) {
    return buildPTML(schema.name, '', allChildren, context);
  }

  const dataParts = generateExampleValueForPart(format.first);
  const adjustedDataParts = adjustDataPartsForConstraints(schema, dataParts, optionalChildName);
  return buildPTML(schema.name, adjustedDataParts, allChildren, context);
};

const buildConditionalRequirementCase = (
  schema: NodeSchema,
  optionalChildName: string,
  context: SchemaExampleContext,
): GeneratedTestCase => {
  return {
    name: `${schema.name} with single-part data and ${optionalChildName} child`,
    description: 'Valid case satisfying conditional requirement',
    ptml: buildConditionalRequirementPTML(schema, optionalChildName, context),
    expectedValid: true,
  };
};

const generateValidCaseWithConditionalRequirement = (
  schema: NodeSchema,
  minParts: number,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const hasBlocks = getBlocksList(schema).length > 0;
  const hasProperties = (schema.properties?.list?.length ?? 0) > 0;
  if (minParts !== 1 || (!hasBlocks && !hasProperties)) {
    return null;
  }

  const optionalChild = findOptionalBlockChild(schema);
  if (!optionalChild) {
    return null;
  }

  return buildConditionalRequirementCase(schema, optionalChild.name, context);
};

const generateOptionalChildCase = (
  schema: NodeSchema,
  dataForNode: string,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const firstOptionalBlock = getBlocksList(schema).find((b) => !b.required);
  const firstOptionalProperty = schema.properties?.list?.find((p) => !p.required);

  const firstChild = firstOptionalBlock || firstOptionalProperty;
  if (!firstChild) {
    return null;
  }

  const isBlock = !!firstOptionalBlock;
  const childPTML = generateChildPTML(firstChild.name, isBlock);
  return {
    name: `${schema.name} with ${firstChild.name} child`,
    description: `Valid case: node with ${firstChild.name} child`,
    ptml: buildPTML(schema.name, dataForNode, [childPTML], context),
    expectedValid: true,
  };
};

const generateCasesWithRequiredData = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: GeneratedTestCase[] = [];
  const dataForNode = getDataForNode(schema);

  const children: string[] = [];
  if (needsChildForMinParts(schema, dataForNode)) {
    const optionalChild = findOptionalBlockChild(schema);
    if (optionalChild) {
      const isBlock = getBlocksList(schema).some((b) => b.name === optionalChild.name);
      const childPTML = generateChildPTML(optionalChild.name, isBlock);
      children.push(childPTML);
    }
  }

  cases.push({
    name: `${schema.name} with data`,
    description: 'Valid case: node with required data',
    ptml: buildPTML(schema.name, dataForNode, children, context),
    expectedValid: true,
  });

  const optionalChildCase = generateOptionalChildCase(schema, dataForNode, context);
  if (optionalChildCase) {
    cases.push(optionalChildCase);
  }

  return cases;
};

const generateCaseWithNoData = (
  schema: NodeSchema,
  context: SchemaExampleContext,
  _requiredChild?: { name: string },
): GeneratedTestCase => {
  const requiredChildren = generateRequiredChildren(schema);
  if (requiredChildren.length > 0) {
    return {
      name: `${schema.name} with no data`,
      description: 'Valid case: node without data',
      ptml: buildPTML(schema.name, '', requiredChildren, context),
      expectedValid: true,
    };
  }
  return {
    name: `${schema.name} with no data`,
    description: 'Valid case: node without data',
    ptml: buildPTML(schema.name, '', [], context),
    expectedValid: true,
  };
};

const generateCasesWithOptionalData = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: GeneratedTestCase[] = [];
  const requiredBlock = getBlocksList(schema).find((b) => b.required);
  const requiredProperty = schema.properties?.list?.find((p) => p.required);
  const requiredChild = requiredBlock || requiredProperty;
  cases.push(generateCaseWithNoData(schema, context, requiredChild));

  const firstOptionalBlock = getBlocksList(schema).find((b) => !b.required);
  const firstOptionalProperty = schema.properties?.list?.find((p) => !p.required);
  const firstOptionalChild = firstOptionalBlock || firstOptionalProperty;

  if (firstOptionalChild) {
    const isBlock = !!firstOptionalBlock;
    const requiredChildren = generateRequiredChildren(schema);
    const optionalChildPTML = generateChildPTML(firstOptionalChild.name, isBlock);
    const allChildren = [...requiredChildren, optionalChildPTML];
    cases.push({
      name: `${schema.name} with ${firstOptionalChild.name} child`,
      description: `Valid case: node with ${firstOptionalChild.name} child`,
      ptml: buildPTML(schema.name, '', allChildren, context),
      expectedValid: true,
    });
  }

  return cases;
};

const createSiblingCaseWithNoData = (
  schema: NodeSchema,
  siblingPTML: string,
  nodePTML: string,
  context: SchemaExampleContext,
): GeneratedTestCase => {
  const schemaMap = getSchemaMap();
  const nodeSchema = schemaMap.get(schema.name);
  const prefix = nodeSchema ? getPrefixForCategory(nodeSchema.category) : '-';
  const correctedNodePTML = removeCategoryPrefix(nodePTML).replace(/^/, `${prefix} `);
  return {
    name: `${schema.name} with no data`,
    description: `Valid case: ${schema.name} node with preceding ${'requiresSibling' in schema ? schema.requiresSibling : 'unknown'} sibling`,
    ptml: wrapInContext(schema.name, `${siblingPTML}\n${correctedNodePTML}`, context),
    expectedValid: true,
  };
};

const createSiblingCaseWithChild = (
  schema: NodeSchema,
  siblingPTML: string,
  childName: string,
  context: SchemaExampleContext,
): GeneratedTestCase => {
  const isBlock = getBlocksList(schema).some((b) => b.name === childName);
  const childPTML = generateChildPTML(childName, isBlock);
  const nodeWithChild = buildNodePTML(schema.name, '', [childPTML], false);
  const siblingName = 'requiresSibling' in schema && schema.requiresSibling ? schema.requiresSibling : 'unknown';
  return {
    name: `${schema.name} with ${childName} child`,
    description: `Valid case: ${schema.name} node with ${childName} child and preceding ${siblingName} sibling`,
    ptml: wrapInContext(schema.name, `${siblingPTML}\n${nodeWithChild}`, context),
    expectedValid: true,
  };
};

const generateValidCaseForSibling = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  if (!schema.example) {
    throw new Error(`Schema for ${schema.name} does not have an example.`);
  }

  const siblingPTML = getSiblingPTML(schema);
  const nodePTML = schema.example;
  const cases: GeneratedTestCase[] = [createSiblingCaseWithNoData(schema, siblingPTML, nodePTML, context)];

  const firstOptionalBlock = getBlocksList(schema).find((b) => !b.required);
  const firstOptionalProperty = schema.properties?.list?.find((p) => !p.required);
  const firstOptionalChild = firstOptionalBlock || firstOptionalProperty;
  if (firstOptionalChild) {
    cases.push(createSiblingCaseWithChild(schema, siblingPTML, firstOptionalChild.name, context));
  }

  return cases;
};

const generateValidCaseWithoutColon = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase | null => {
  const canExistWithoutData = !schema.data.allowed || !schema.data.required;
  if (!canExistWithoutData) {
    return null;
  }

  const requiredChildren = generateRequiredChildren(schema);
  const isRoot = context.parentNode === undefined;
  const ptmlWithoutColon = buildNodePTML(schema.name, '', requiredChildren, isRoot, false);

  return {
    name: `${schema.name} without colon`,
    description: `Valid case: ${schema.category} node without colon (no data present)`,
    ptml: wrapInContext(schema.name, ptmlWithoutColon, context),
    expectedValid: true,
  };
};

const generateValidCasesForNoDataNodes = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: GeneratedTestCase[] = [];

  if ('requiresSibling' in schema && schema.requiresSibling) {
    return generateValidCaseForSibling(schema, context);
  }

  const regularCases = generateValidCaseForRegularNode(schema, context);
  cases.push(...regularCases);

  const withoutColonCase = generateValidCaseWithoutColon(schema, context);
  if (withoutColonCase) {
    cases.push(withoutColonCase);
  }

  return cases;
};

export const generateValidCaseForRegularNode = (
  schema: NodeSchema,
  context: SchemaExampleContext,
): GeneratedTestCase[] => {
  if (schema.data.required) {
    return generateCasesWithRequiredData(schema, context);
  }
  return generateCasesWithOptionalData(schema, context);
};

const generateRequiredChildren = (schema: NodeSchema): string[] => {
  if (schema.name === 'breakpoints') {
    return ['- small: 768', '- large:'];
  }
  const children: string[] = [];
  const requiredBlocks = getBlocksList(schema).filter((b) => b.required);
  const requiredProperties = schema.properties?.list?.filter((p) => p.required) ?? [];
  for (const requiredBlock of requiredBlocks) {
    const childPTML = generateChildPTML(requiredBlock.name, true);
    children.push(childPTML);
  }
  for (const requiredProperty of requiredProperties) {
    const childPTML = generateChildPTML(requiredProperty.name, false);
    children.push(childPTML);
  }
  return children;
};

const addOptionalChildIfNeeded = (
  schema: NodeSchema,
  dataParts: string,
  children: string[],
  requiredChildrenCount: number,
): boolean => {
  if (!needsChildForMinParts(schema, dataParts)) {
    return true;
  }
  const optionalChild = findOptionalBlockChild(schema);
  if (optionalChild) {
    const childPTML = generateChildPTML(optionalChild.name);
    children.push(childPTML);
    return true;
  }
  return requiredChildrenCount > 0;
};

const createValidTestCase = (
  schema: NodeSchema,
  dataParts: string,
  children: string[],
  name: string,
  minParts: number,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const testNode = createTestNodeFromPTML(schema, dataParts, children);
  if (!validateConstraints(schema, testNode)) {
    return null;
  }

  return {
    name,
    description: `Valid case with minimum required data (${minParts} part(s))`,
    ptml: buildPTML(schema.name, dataParts, children, context),
    expectedValid: true,
  };
};

const generateValidCaseWithMinData = (
  schema: NodeSchema,
  minParts: number,
  context: SchemaExampleContext,
): GeneratedTestCase | null => {
  const { dataParts, name } = getDataPartsForMinData(schema, minParts);
  const children = generateRequiredChildren(schema);
  const requiredBlocks = getBlocksList(schema).filter((b) => b.required);
  const requiredProperties = schema.properties?.list?.filter((p) => p.required) ?? [];
  const requiredChildrenCount = requiredBlocks.length + requiredProperties.length;

  if (!addOptionalChildIfNeeded(schema, dataParts, children, requiredChildrenCount)) {
    return null;
  }

  return createValidTestCase(schema, dataParts, children, name, minParts, context);
};

const generateValidCasesForDataNodes = (schema: NodeSchema, context: SchemaExampleContext): GeneratedTestCase[] => {
  const cases: GeneratedTestCase[] = [];
  const minParts = schema.data.min || 1;

  const minDataCase = generateValidCaseWithMinData(schema, minParts, context);
  if (minDataCase) {
    cases.push(minDataCase);
  }

  const restCase = generateValidCaseWithRest(schema, context);
  if (restCase) {
    cases.push(restCase);
  }

  const optionalChildCase = generateValidCaseWithOptionalChild(schema, context);
  if (optionalChildCase) {
    cases.push(optionalChildCase);
  }

  const conditionalCase = generateValidCaseWithConditionalRequirement(schema, minParts, context);
  if (conditionalCase) {
    cases.push(conditionalCase);
  }

  return cases;
};

export const generateValidCases = (schema: NodeSchema): GeneratedTestCase[] => {
  const context = buildMinimalExampleContext(schema.name);

  if (schema.data.allowed === false || schema.data.required === false || !schema.data.required) {
    return generateValidCasesForNoDataNodes(schema, context);
  }

  return generateValidCasesForDataNodes(schema, context);
};
