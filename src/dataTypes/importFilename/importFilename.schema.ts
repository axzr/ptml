import type { DataTypeSchema } from '../types';
import { validateImportFilename } from './importFilename.validation';

export const importFilenameSchema: DataTypeSchema = {
  name: 'import-filename',
  description: 'Simple filename with no path (e.g. templates.ptml)',
  example: 'templates.ptml',
  functions: {
    validate: validateImportFilename,
  },
};
