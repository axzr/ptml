import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ListErrors } from '../../errors/messages';
import { checkListExists } from '../../validation/validators/helpers';

export const validateListNameReference = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(' ')) {
    throw new Error(ListErrors.invalidListName(node.type, node.lineNumber, trimmed));
  }

  if (context && !checkListExists(trimmed, context)) {
    throw new Error(ListErrors.undefinedList(node.type, node.lineNumber, trimmed));
  }
};
