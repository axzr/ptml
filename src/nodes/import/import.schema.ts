import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';

export const importSchema: NodeSchema = {
  name: 'import',
  category: 'declaration',
  description:
    'Root node for importing templates and named styles from another PTML file. The data is a simple filename (e.g. templates.ptml) with no path. Imported templates and defines become available as if declared in the current file.',
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
        name: 'filename',
        description: 'Simple filename with no path (e.g. templates.ptml)',
        required: true,
        format: {
          type: 'string',
          validator: 'import-filename',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: 'import: templates.ptml',
  functions: {
    validate: validateDeclarationDefault,
    getContext: () => ({ parentNode: undefined }),
  },
};
