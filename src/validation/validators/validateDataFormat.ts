import type { Node } from '../../types';
import type { DataSchema } from '../../schemas/types';
import type { ValidationContext } from '../types';
import { DataFormatErrors } from '../../errors/messages';
import { getDataTypeSchema } from '../../dataTypes/dataTypeMap';

export const getDataParts = (data: string | undefined, separator: 'space' | 'comma' = 'space'): string[] => {
  if (!data) {
    return [];
  }
  const trimmed = data.trim();
  if (!trimmed) {
    return [];
  }
  if (separator === 'comma') {
    return trimmed
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }
  return trimmed.split(/\s+/).filter((part) => part.length > 0);
};

export const getRestPartsStartIndex = (format: DataSchema['format']): number =>
  (format?.first ? 1 : 0) + (format?.second ? 1 : 0);

const runDataTypeValidator = (
  validatorName: string,
  value: string,
  node: Node,
  context: ValidationContext | undefined,
): void => {
  const dataTypeSchema = getDataTypeSchema(validatorName);
  const validator = dataTypeSchema?.functions.validate;
  if (validator) {
    validator(value, node, context);
  }
};

const validateRestPartsRequired = (format: DataSchema['format'], node: Node, parts: string[]): void => {
  if (!format?.rest?.required) {
    return;
  }

  const expectedMinParts = getRestPartsStartIndex(format) + 1;
  if (parts.length < expectedMinParts) {
    throw new Error(
      DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, format.rest.name, format.rest.description),
    );
  }
};

const validateRestPartsValidators = (
  format: DataSchema['format'],
  node: Node,
  parts: string[],
  context: ValidationContext | undefined,
): void => {
  if (!format?.rest?.format?.validator) {
    return;
  }

  const restPartsStart = getRestPartsStartIndex(format);
  if (parts.length <= restPartsStart) {
    return;
  }

  const validatorName = format.rest.format.validator;
  const dataTypeSchema = getDataTypeSchema(validatorName);
  const restParts = parts.slice(restPartsStart);

  if (dataTypeSchema?.isMultiPart) {
    runDataTypeValidator(validatorName, restParts.join(' '), node, context);
  } else {
    for (let i = restPartsStart; i < parts.length; i++) {
      runDataTypeValidator(validatorName, parts[i], node, context);
    }
  }
};

const validateDataFormatRest = (
  format: DataSchema['format'],
  node: Node,
  parts: string[],
  context: ValidationContext | undefined,
): void => {
  validateRestPartsRequired(format, node, parts);
  validateRestPartsValidators(format, node, parts, context);
};

const validateDataFormatFirst = (
  format: DataSchema['format'],
  node: Node,
  parts: string[],
  context: ValidationContext | undefined,
): void => {
  if (format?.first?.required && parts.length === 0) {
    throw new Error(
      DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, format.first.name, format.first.description),
    );
  }

  if (format?.first?.format?.validator && parts.length > 0) {
    const validatorName = format.first.format.validator;
    const dataTypeSchema = getDataTypeSchema(validatorName);
    const value = dataTypeSchema?.isMultiPart ? parts.join(' ') : parts[0];
    runDataTypeValidator(validatorName, value, node, context);
  }
};

const validateDataFormatSecond = (
  format: DataSchema['format'],
  node: Node,
  parts: string[],
  context: ValidationContext | undefined,
): void => {
  if (format?.second?.required && parts.length < 2) {
    throw new Error(
      DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, format.second.name, format.second.description),
    );
  }

  if (format?.second?.format?.validator && parts.length > 1) {
    const validatorName = format.second.format.validator;
    const secondPartValue = format.second.format.type === 'expression' ? parts.slice(1).join(' ') : parts[1];
    runDataTypeValidator(validatorName, secondPartValue, node, context);
  }
};

const validateDataFormatParts = (format: DataSchema['format'], node: Node, parts: string[]): void => {
  for (let i = 0; i < (format?.parts?.length ?? 0); i++) {
    const partSchema = format?.parts?.[i];

    if (partSchema?.required && parts.length <= i) {
      throw new Error(
        DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, partSchema.name, partSchema.description),
      );
    }
  }
};

export const validateDataFormat = (
  dataSchema: DataSchema,
  node: Node,
  context: ValidationContext | undefined,
): void => {
  if (!dataSchema.format) {
    return;
  }

  const separator = dataSchema.format.separator || 'space';
  const parts = getDataParts(node.data, separator);

  validateDataFormatFirst(dataSchema.format, node, parts, context);
  validateDataFormatSecond(dataSchema.format, node, parts, context);
  validateDataFormatRest(dataSchema.format, node, parts, context);
  validateDataFormatParts(dataSchema.format, node, parts);
};
