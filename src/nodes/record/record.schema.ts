import type { NodeSchema } from '../../schemas/types';
import { validateRecord } from './record.validation';

export const recordSchema: NodeSchema = {
  name: 'record',
  category: 'property',
  description:
    'A record node that stores key-value pairs. Records have no data themselves, but contain children where each child type is a key and child data is the value. Keys must be unique within a record.',
  properties: {
    allowAny: true,
    list: [{ name: 'key-value', required: true }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: '- record:',
  functions: {
    validate: validateRecord,
    getContext: () => ({ lists: ['items'], parentNode: 'recordList' }),
  },
};
