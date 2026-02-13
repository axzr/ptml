import { getExampleContextForListOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { processAddRecordOperation, executeAddRecordOperation } from './addRecord.execute';
import type { NodeSchema } from '../../schemas/types';

export const addRecordSchema: NodeSchema = {
  name: 'addRecord',
  category: 'action',
  description: 'Adds a record to a list. The record is defined as a child node.',
  blocks: {
    list: [],
  },
  properties: {
    list: [{ name: 'record', required: true, max: 1 }],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description: 'The name of the list to add the record to',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: '- addRecord: expenses\n    - record:\n      - name: Item',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListOperations,
    listOperationHandler: processAddRecordOperation,
    execute: executeAddRecordOperation,
  },
};
