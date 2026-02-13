import type { DataTypeSchema } from '../types';
import { validateWhereCondition } from './whereCondition.validation';

export const whereConditionSchema: DataTypeSchema = {
  name: 'where-condition',
  description: 'Where condition',
  example: 'id is $contactId',
  isMultiPart: true,
  functions: {
    validate: validateWhereCondition,
  },
};
