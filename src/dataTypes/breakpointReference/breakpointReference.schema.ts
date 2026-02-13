import type { DataTypeSchema } from '../types';
import { validateBreakpointReference } from './breakpointReference.validation';

export const breakpointReferenceSchema: DataTypeSchema = {
  name: 'breakpoint-reference',
  description:
    'Breakpoint label or "label or more" or "label or less". Label must match a breakpoint defined in a breakpoints declaration.',
  example: 'small',
  functions: {
    validate: validateBreakpointReference,
  },
};
