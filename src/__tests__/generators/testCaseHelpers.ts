import type { Node, NodeCategory } from '../../types';
import type { NodeSchema, ChildNodeSchema } from '../../schemas/types';
import { getBlocksList, getSchemaMap } from '../../schemaRegistry/schemaMap';
import { getDataTypeSchema } from '../../dataTypes/dataTypeMap';
import { removeCategoryPrefix } from '../../utils/regexPatterns';

const defaultCategory = 'block';
const defaultSeparator = 'space';
const preferredPropertyTypesForWrongPropertyChildren = ['styles', 'click', 'where', 'record'];
const defaultWrongPropertyType = 'styles';
const preferredTypesForWrongBlockChildren = ['text', 'box', 'record', 'button'];
const defaultWrongBlockType = 'text';

const defaultListName = 'items';
const defaultFunctionName = '$myFunction';

const determineCategory = (nodeType: string): NodeCategory => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(nodeType);
  if (schema) {
    return schema.category;
  }

  return defaultCategory;
};

export const findOptionalBlockChild = (schema: NodeSchema): ChildNodeSchema | undefined =>
  getBlocksList(schema).find((b) => !b.required);

const getValueFromPartName = (partName: string): string | null => {
  if (partName.includes('variable') && partName.includes('binding')) {
    return 'as $name';
  }
  if (partName.includes('variable')) {
    return partName.includes('function') ? defaultFunctionName : '$x';
  }
  if (partName.includes('list')) return defaultListName;
  if (partName.includes('function')) return 'increment';
  if (partName.includes('condition')) return '$isActive';
  if (partName.includes('index') && (partName.includes('expression') || partName.includes('binding'))) {
    return partName.includes('binding') ? 'index as $index' : '0';
  }
  if (partName.includes('value') || partName.includes('expression')) return '0';
  if (partName === 'filename') return 'templates.ptml';
  return null;
};

const getValueFromValidator = (validator: string | undefined, partName: string): string | null => {
  if (!validator) {
    return null;
  }

  const dataTypeSchema = getDataTypeSchema(validator);
  if (dataTypeSchema?.getExample) {
    return dataTypeSchema.getExample(partName);
  }
  return dataTypeSchema?.example ?? null;
};

export const generateExampleValueForPart = (partSchema: { name: string; format: { validator?: string } }): string => {
  const validator = partSchema.format.validator;
  const partName = partSchema.name;

  return getValueFromValidator(validator, partName) || getValueFromPartName(partName) || 'value';
};

export const generateRequiredChildPTML = (requiredChild: { name: string }, isBlock: boolean): string => {
  if (requiredChild.name === 'key-value') {
    return '- key: value';
  }

  const childSchemaMap = getSchemaMap();
  const nestedChildSchema = childSchemaMap.get(requiredChild.name);
  if (nestedChildSchema) {
    const prefix = getPrefixForCategory(nestedChildSchema.category);
    const example = nestedChildSchema.example || `- ${requiredChild.name}:`;
    return removeCategoryPrefix(example).replace(/^/, `${prefix} `);
  }

  const prefix = isBlock ? '>' : '-';
  const value = isBlock ? '' : ' value';
  return `${prefix} ${requiredChild.name}:${value}`;
};

export const getPrefixForCategory = (category: string): string => {
  switch (category) {
    case 'block':
      return '>';
    case 'property':
      return '-';
    case 'conditional':
      return '?';
    case 'action':
      return '!';
    case 'declaration':
      return '';
    default:
      return '-';
  }
};

const getDataPartFromSchema = (childSchema: NodeSchema): string => {
  if (childSchema.data.required && childSchema.data.format?.first) {
    const dataValue = generateExampleValueForPart(childSchema.data.format.first);
    return ` ${dataValue}`;
  }
  if (childSchema.example) {
    const extractExampleData = (text: string): string | null => {
      const match = text.match(/:\s*(.+)$/);
      return match ? match[1] : null;
    };

    const exampleMatch = extractExampleData(childSchema.example);
    if (exampleMatch) {
      return ` ${exampleMatch[1]}`;
    }
  }
  return '';
};

const generateRequiredChildrenPTML = (childSchema: NodeSchema): string => {
  const requiredBlocks = getBlocksList(childSchema).filter((b) => b.required);
  const requiredProperties = childSchema.properties?.list?.filter((p) => p.required) ?? [];

  if (requiredBlocks.length === 0 && requiredProperties.length === 0) {
    return '';
  }

  const requiredChildrenPTML: string[] = [];
  for (const requiredBlock of requiredBlocks) {
    requiredChildrenPTML.push(generateRequiredChildPTML(requiredBlock, true));
  }
  for (const requiredProperty of requiredProperties) {
    requiredChildrenPTML.push(generateRequiredChildPTML(requiredProperty, false));
  }

  const indent = '  ';
  return requiredChildrenPTML.map((child) => `${indent}${child}`).join('\n');
};

export const generateChildPTML = (childName: string, isBlock: boolean = false): string => {
  const schemaMap = getSchemaMap();
  const childSchema = schemaMap.get(childName);

  if (!childSchema) {
    const prefix = isBlock ? '>' : '-';
    return `${prefix} ${childName}: value`;
  }

  const prefix = getPrefixForCategory(childSchema.category);
  const dataPart = getDataPartFromSchema(childSchema);
  const basePTML = `${prefix} ${childName}:${dataPart}`;

  const childrenPTML = generateRequiredChildrenPTML(childSchema);
  if (childrenPTML) {
    return `${basePTML}\n${childrenPTML}`;
  }

  return basePTML;
};

export const getSiblingPTML = (schema: NodeSchema): string => {
  const schemaMap = getSchemaMap();
  if (!('requiresSibling' in schema) || !schema.requiresSibling) {
    throw new Error(`Schema ${schema.name} does not have requiresSibling property`);
  }
  const siblingSchema = schemaMap.get(schema.requiresSibling);

  if (!siblingSchema || !siblingSchema.example) {
    throw new Error(`Sibling schema "${schema.requiresSibling}" not found or missing example for ${schema.name} node.`);
  }

  const prefix = getPrefixForCategory(siblingSchema.category);
  return removeCategoryPrefix(siblingSchema.example).replace(/^/, `${prefix} `);
};

export const needsChildForMinParts = (schema: NodeSchema, dataParts: string): boolean => {
  const hasBlocks = getBlocksList(schema).length > 0;
  const hasProperties = (schema.properties?.list?.length ?? 0) > 0;
  if (!schema.data.constraints || (!hasBlocks && !hasProperties)) {
    return false;
  }

  const testNodeWithoutChild: Node = {
    category: schema.category,
    type: schema.name,
    data: dataParts,
    children: [],
    lineNumber: 1,
  } as Node;

  for (const constraint of schema.data.constraints) {
    if (!constraint.validate(testNodeWithoutChild)) {
      return true;
    }
  }

  return false;
};

const removeOptionalPrefix = (text: string): string => {
  return text.replace(/^-?\s*/, '');
};

export const createTestNodeFromPTML = (schema: NodeSchema, dataParts: string, childrenPTML: string[]): Node => {
  const children: Node[] = childrenPTML.map((childPTML) => {
    const childType = childPTML.trim().split(/[:\s]/)[0];

    removeOptionalPrefix(childPTML.trim().split(/[:\s]/)[0]);

    const childCategory = determineCategory(childType);
    return {
      category: childCategory,
      type: childType,
      data: '',
      children: [],
      lineNumber: 1,
    } as Node;
  });

  return {
    category: schema.category,
    type: schema.name,
    data: dataParts,
    children,
    lineNumber: 1,
  } as Node;
};

export const validateConstraints = (schema: NodeSchema, testNode: Node): boolean => {
  if (!schema.data.constraints) {
    return true;
  }

  for (const constraint of schema.data.constraints) {
    if (!constraint.validate(testNode)) {
      return false;
    }
  }

  return true;
};

const createTestNodeWithChild = (schemaName: string, dataParts: string, childName: string): Node => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(schemaName);
  const childCategory = determineCategory(childName);
  return {
    category: schema?.category || defaultCategory,
    type: schemaName,
    data: dataParts,
    children: [{ category: childCategory, type: childName, data: '', children: [], lineNumber: 1 } as Node],
    lineNumber: 1,
  } as Node;
};

export const adjustDataPartsForConstraints = (
  schema: NodeSchema,
  dataParts: string,
  optionalChildName: string,
): string => {
  if (!schema.data.constraints) {
    return dataParts;
  }

  const testNode = createTestNodeWithChild(schema.name, dataParts, optionalChildName);
  const allConstraintsPass = schema.data.constraints.every((constraint) => constraint.validate(testNode));

  if (!allConstraintsPass) {
    return schema.data.format?.first ? generateExampleValueForPart(schema.data.format.first) : '';
  }

  return dataParts;
};

export const generateTestNameFromParts = (schemaName: string, partNames: string[]): string => {
  if (partNames.length === 0) {
    return `${schemaName} with no data`;
  }
  if (partNames.length === 1) {
    return `${schemaName} with ${partNames[0]}`;
  }
  if (partNames.length === 2) {
    return `${schemaName} with ${partNames[0]} and ${partNames[1]}`;
  }
  return `${schemaName} with ${partNames[0]} and ${partNames[partNames.length - 1]}`;
};

export const collectDataParts = (
  format: NonNullable<NodeSchema['data']['format']>,
  minParts: number,
): { parts: string[]; partNames: string[] } => {
  const parts: string[] = [];
  const partNames: string[] = [];

  if (format.first) {
    parts.push(generateExampleValueForPart(format.first));
    partNames.push(format.first.name);
  }

  if (minParts >= 2 && format.second) {
    parts.push(generateExampleValueForPart(format.second));
    partNames.push(format.second.name);
  }

  if (minParts > 2 && format.rest) {
    parts.push(generateExampleValueForPart(format.rest));
    partNames.push(format.rest.name);
  }

  return { parts, partNames };
};

export const getDataPartsForMinData = (schema: NodeSchema, minParts: number): { dataParts: string; name: string } => {
  const format = schema.data.format;
  if (!format) {
    return { dataParts: '', name: `${schema.name} with no data` };
  }

  const { parts, partNames } = collectDataParts(format, minParts);
  const dataParts = parts.join(' ');
  const name = generateTestNameFromParts(schema.name, partNames);

  return { dataParts, name };
};

export const getDataForNode = (schema: NodeSchema): string => {
  if (schema.data.allowed === false) {
    return '';
  }

  if (!schema.data.required && !schema.data.format) {
    return '';
  }

  const format = schema.data.format;
  if (!format) {
    return '';
  }

  const parts: string[] = [];
  const separator = format.separator || defaultSeparator;

  if (format.first) {
    parts.push(generateExampleValueForPart(format.first));
  }

  const minParts = schema.data.min || 0;

  if (format.second && (format.second.required || parts.length < minParts)) {
    parts.push(generateExampleValueForPart(format.second));
  }

  if (format.rest && (format.rest.required || parts.length < minParts)) {
    parts.push(generateExampleValueForPart(format.rest));
  }

  return parts.join(separator === 'comma' ? ', ' : ' ');
};

export const findWrongChildType = (allowedChildTypes: string[]): string => {
  const schemaMap = getSchemaMap();
  const allowedSet = new Set(allowedChildTypes);

  for (const preferredType of preferredTypesForWrongBlockChildren) {
    if (!allowedSet.has(preferredType)) {
      return preferredType;
    }
  }

  for (const [name] of schemaMap.entries()) {
    if (!allowedSet.has(name)) {
      return name;
    }
  }

  return defaultWrongBlockType;
};

export const findWrongPropertyType = (allowedPropertyTypes: string[]): string => {
  const schemaMap = getSchemaMap();
  const allowedSet = new Set(allowedPropertyTypes);

  for (const preferredType of preferredPropertyTypesForWrongPropertyChildren) {
    if (!allowedSet.has(preferredType)) {
      return preferredType;
    }
  }

  for (const [name] of schemaMap.entries()) {
    if (!allowedSet.has(name)) {
      return name;
    }
  }

  return defaultWrongPropertyType;
};

export const createConstraintTestNode = (schema: NodeSchema): Node => {
  const minParts = schema.data.min || 1;
  const { dataParts } = getDataPartsForMinData(schema, minParts);

  const firstBlock = getBlocksList(schema)[0];
  const firstProperty = schema.properties?.list?.[0];
  const firstChild = firstBlock || firstProperty;
  const children = firstChild
    ? [
        {
          category: determineCategory(firstChild.name),
          type: firstChild.name,
          data: '',
          children: [],
          lineNumber: 1,
        } as Node,
      ]
    : [];

  return {
    category: schema.category,
    type: schema.name,
    data: dataParts,
    children,
    lineNumber: 1,
  } as Node;
};

export const generateDataWithRestOrSecond = (schema: NodeSchema): string | null => {
  const format = schema.data.format;
  if (!format?.first) {
    return null;
  }

  const parts: string[] = [generateExampleValueForPart(format.first)];

  if (format.rest) {
    parts.push(generateExampleValueForPart(format.rest));
  } else if (format.second) {
    parts.push(generateExampleValueForPart(format.second));
  } else {
    return null;
  }

  return parts.join(' ');
};
