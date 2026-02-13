import { getExampleContextForListOperations } from '../../schemaRegistry/schemaExampleContext';
import { validateActionDefault } from '../../categories/action/action.validation';
import { processRemoveRecordOperation, executeRemoveRecordOperation } from './removeRecord.execute';
import type { NodeSchema } from '../../schemas/types';

export const removeRecordSchema: NodeSchema = {
  name: 'removeRecord',
  category: 'action',
  description:
    'Removes a record from a list by variable reference. Typically used within each loops where the record is available as a loop variable.',
  blocks: {
    list: [],
  },
  properties: {
    list: [],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description: 'The name of the list to remove the record from',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-reference',
        },
      },
      second: {
        name: 'item-variable',
        description:
          'Required item variable value (must start with $) to the record to remove. Must specify both list name and item variable. Use format: removeRecord: <listName> $item',
        required: true,
        format: {
          type: 'string',
          validator: 'variable-reference',
        },
      },
    },
    min: 2,
    max: 2,
  },
  example: '- removeRecord: items $item',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: getExampleContextForListOperations,
    listOperationHandler: processRemoveRecordOperation,
    execute: executeRemoveRecordOperation,
  },
};
