import type { DataTypeSchema } from '../types';
import { validateBreakpointReference } from './breakpointReference.validation';

export const breakpointReferenceSchema: DataTypeSchema = {
  name: 'breakpoint-reference',
  description:
    'Breakpoint label on its own, or followed by "or more" (that label\'s range and every wider one) or "or less" (that label\'s range and every narrower one). The label must match one defined in a breakpoints declaration; an undeclared label is an error, because it could never match.',
  example: 'small',
  // "small or less" is one value spanning three whitespace-separated parts;
  // without this the format validator would only ever see "small".
  isMultiPart: true,
  functions: {
    validate: validateBreakpointReference,
  },
};
