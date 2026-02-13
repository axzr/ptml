import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ListErrors } from '../../errors/messages';

export const validateValue = (node: Node, _context: ValidationContext): void => {
  if (!node.data || node.data.trim().length === 0) {
    throw new Error(ListErrors.emptyValueItem(node.lineNumber));
  }
};
