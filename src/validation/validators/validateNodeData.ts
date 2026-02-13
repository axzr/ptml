import type { Node } from '../../types';
import type { NodeSchema, DataSchema } from '../../schemas/types';
import type { ValidationContext } from '../types';
import { getDataParts, getRestPartsStartIndex, validateDataFormat } from './validateDataFormat';
import { DataFormatErrors } from '../../errors/messages';

const validateDataAllowed = (dataSchema: DataSchema, node: Node): void => {
  if (dataSchema.allowed === false && node.data) {
    const trimmed = (node.data || '').trim();
    if (trimmed.length > 0) {
      throw new Error(DataFormatErrors.dataNotAllowed(node.type, node.lineNumber));
    }
  }
};

const validateDataRequired = (dataSchema: DataSchema, node: Node): void => {
  const isRequired = dataSchema.required === true;

  if (isRequired) {
    const trimmed = (node.data || '').trim();
    if (!trimmed || trimmed.length === 0) {
      const formatFirst = dataSchema.format?.first;

      throw new Error(
        DataFormatErrors.missingRequiredPart(
          node.type,
          node.lineNumber,
          formatFirst?.name ?? 'data',
          formatFirst?.description,
        ),
      );
    }
  }
};

const validateMinPartsWithSecond = (
  node: Node,
  minParts: number,
  parts: string[],
  format: DataSchema['format'],
): void => {
  if (minParts === 2 && parts.length === 1) {
    const secondPart = format?.second || format?.rest;
    if (secondPart) {
      throw new Error(
        DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, secondPart.name, secondPart.description),
      );
    }
  }
  if (minParts === 3 && parts.length === 2) {
    const restPart = format?.rest;
    if (restPart) {
      throw new Error(
        DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, restPart.name, restPart.description),
      );
    }
  }
};

const validateMinPartsError = (node: Node, minParts: number, parts: string[], format: DataSchema['format']): void => {
  validateMinPartsWithSecond(node, minParts, parts, format);

  if (parts.length === 0) {
    const formatFirst = format?.first;
    throw new Error(
      DataFormatErrors.missingRequiredPart(
        node.type,
        node.lineNumber,
        formatFirst?.name || 'data',
        formatFirst?.description,
      ),
    );
  }
  if (parts.length === 1 && minParts >= 2) {
    const secondPart = format?.second || format?.rest;
    if (secondPart) {
      throw new Error(
        DataFormatErrors.missingRequiredPart(node.type, node.lineNumber, secondPart.name, secondPart.description),
      );
    }
  }
};

const validateDataMinMax = (dataSchema: DataSchema, node: Node): void => {
  const separator = dataSchema.format?.separator || 'space';
  const parts = getDataParts(node.data, separator);

  const minParts = dataSchema.min;
  if (minParts !== undefined && parts.length < minParts) {
    validateMinPartsError(node, minParts, parts, dataSchema.format);
  }

  const maxParts = dataSchema.max;
  if (maxParts !== undefined && parts.length > maxParts) {
    throw new Error(DataFormatErrors.maxPartsExceeded(node.type, node.lineNumber, maxParts, parts.length));
  }
};

const getRestParts = (dataSchema: DataSchema, node: Node): string[] => {
  const separator = dataSchema.format?.separator || 'space';
  const parts = getDataParts(node.data, separator);
  return parts.slice(getRestPartsStartIndex(dataSchema.format));
};

const needsDataNoRepeats = (dataSchema: DataSchema, restParts: string[]): boolean => {
  return dataSchema.noRepeats === true && restParts.length >= 2;
};

const validateDataNoRepeats = (dataSchema: DataSchema, node: Node): void => {
  const restParts = getRestParts(dataSchema, node);

  if (!needsDataNoRepeats(dataSchema, restParts)) {
    return;
  }

  const seenParts = new Map<string, number>();
  const duplicateParts: string[] = [];

  for (const part of restParts) {
    const count = seenParts.get(part) || 0;
    seenParts.set(part, count + 1);
    if (count === 1 && !duplicateParts.includes(part)) {
      duplicateParts.push(part);
    }
  }

  if (duplicateParts.length > 0) {
    throw new Error(
      DataFormatErrors.duplicateParts(
        node.type,
        node.lineNumber,
        dataSchema.format?.rest?.name || 'data',
        duplicateParts.join(', '),
      ),
    );
  }
};

const validateDataConstraints = (dataSchema: DataSchema, node: Node): void => {
  if (!dataSchema.constraints) {
    return;
  }

  for (const constraint of dataSchema.constraints) {
    if (!constraint.validate(node)) {
      throw new Error(DataFormatErrors.constraintViolation(node.type, node.lineNumber, constraint.description));
    }
  }
};

export const validateNodeData = (schema: NodeSchema, node: Node, context?: ValidationContext): void => {
  const dataSchema: DataSchema = schema.data;

  validateDataAllowed(dataSchema, node);
  validateDataRequired(dataSchema, node);
  validateDataMinMax(dataSchema, node);
  validateDataFormat(dataSchema, node, context);
  validateDataNoRepeats(dataSchema, node);
  validateDataConstraints(dataSchema, node);
};
