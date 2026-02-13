import { getExampleContextForListGetSetOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { processSetRecordOperation, executeSetRecordOperation } from './setRecord.execute';
import type { NodeSchema } from '../../schemas/types';

export const setRecordSchema: NodeSchema = {
  name: 'setRecord',
  category: 'action',
  skipsRenderingInLoops: true,
  description:
    'Sets a record in a list at a specific index. The index can be a number or a variable reference. The record is defined as a child node.',
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
        description: 'The name of the list to set the record in',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'index',
        description: 'The index (number or variable reference starting with $) where to set the record',
        required: true,
        format: {
          type: 'string',
          validator: 'index-expression',
        },
      },
    },
    min: 2,
    max: 2,
  },
  example: '- setRecord: items $index\n    - record:\n      - name: Item',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListGetSetOperations,
    listOperationHandler: processSetRecordOperation,
    execute: executeSetRecordOperation,
  },
};
