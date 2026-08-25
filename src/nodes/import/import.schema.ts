import type { NodeSchema } from '../../schemas/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';

export const importSchema: NodeSchema = {
  name: 'import',
  category: 'declaration',
  description:
    'Root node for importing templates and named styles from another PTML file. The data is a simple filename (e.g. templates.ptml) with no path. Imported templates and defines become available as if declared in the current file. Imports are transitive: an imported file may import others, and everything reachable that way becomes available. Where two files declare the same name, the nearer one wins -- this document beats what it imports, and a nearer import beats a deeper one; between two imports in the same file, the later wins. Circular imports resolve rather than recursing. An import naming a file that was not supplied, or one that is not valid PTML, is an error rather than being quietly skipped.',
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
