import { validateActionDefault } from '../../categories/action/action.validation';
import { executeUpdateRecordOperation } from './updateRecord.execute';
import { indentChildLines } from '../../schemaRegistry/ptmlBuilder';
import type { NodeSchema } from '../../schemas/types';

export const updateRecordSchema: NodeSchema = {
  name: 'updateRecord',
  category: 'action',
  description:
    'Updates a record in a list by finding it using a where clause and replacing it with a new record. The where clause specifies which property to match, and the record child defines the new values.',
  blocks: {
    list: [],
  },
  properties: {
    list: [
      { name: 'where', required: true, max: 1 },
      { name: 'record', required: true, max: 1 },
    ],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'list-name',
        description: 'The name of the list to update a record in',
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
  example: '- updateRecord: contacts\n  - where: id is $contactId\n  - record:\n    - name: $name\n    - email: $email',
  requiresFunctionalContext: true,
  functions: {
    validate: validateActionDefault,
    getContext: () => ({ lists: ['items'], state: { x: '0', contactId: '1' }, parentNode: 'click' }),
    execute: executeUpdateRecordOperation,
    wrapAsParent: (nodePTML: string) => {
      const DEFAULT_CONTACTS_LIST = 'contacts';
      return [
        `recordList: ${DEFAULT_CONTACTS_LIST}`,
        '- record:',
        '  - id: 1',
        '  - name: John',
        'state:',
        '- contactId: 1',
        'ptml:',
        '> button:',
        '  - click:',
        `    ! updateRecord: ${DEFAULT_CONTACTS_LIST}`,
        indentChildLines(nodePTML, 6),
        '      - record:',
        '        - id: 1',
        '        - name: Updated',
      ];
    },
  },
};
