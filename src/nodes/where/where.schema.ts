import type { NodeSchema } from '../../schemas/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';

export const whereSchema: NodeSchema = {
  name: 'where',
  category: 'property',
  description:
    'Specifies a condition to match items in a list. Used as a child of updateRecord to find items by property value.',
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
        name: 'condition',
        description:
          'Required condition expression in format "PROPERTYNAME is MATCHVALUE". The property name can be a simple property (e.g., "id") or nested property (e.g., "contact.id"). The match value can be a literal or variable reference (e.g., "$contactId").',
        required: true,
        format: {
          type: 'string',
          validator: 'where-condition',
        },
      },
    },
    min: 1,
  },
  example: '- where: id is $contactId',
  functions: {
    validate: validatePropertyDefault,
    getContext: () => ({
      lists: ['contacts'],
      state: { contactId: '1', name: 'John', email: 'john@example.com' },
      parentNode: 'updateRecord',
    }),
  },
};
