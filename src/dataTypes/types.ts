import type { Node } from '../types';
import type { ValidationContext } from '../validation/types';

export type DataTypeValidator = (value: string, node: Node, context?: ValidationContext) => void;

export type DataTypeSchema = {
  name: string;
  description: string;
  example: string;
  isMultiPart?: boolean;
  getExample?: (partName: string) => string;
  functions: {
    validate: DataTypeValidator;
  };
};
