import type { DataTypeSchema } from '../types';
import { validateHeadingLevel } from './headingLevel.validation';

export const headingLevelSchema: DataTypeSchema = {
  name: 'heading-level',
  description: 'Heading level: h1 through h6',
  example: 'h1',
  functions: {
    validate: validateHeadingLevel,
  },
};
