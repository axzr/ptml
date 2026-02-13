import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

export const validateRowRole = (value: string, node: Node): void => {
  const trimmed = value.trim().toLowerCase();
  const validRoles = ['header', 'body', 'footer'];
  if (!validRoles.includes(trimmed)) {
    throw new Error(ValidatorErrors.rowRoleInvalid(node.type, node.lineNumber, value.trim()));
  }
};
