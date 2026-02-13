import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

const VALID_BOX_ROLES = ['main', 'header', 'footer', 'article', 'section', 'nav', 'aside'] as const;

export const validateBoxRole = (value: string, node: Node): void => {
  const trimmed = value.trim().toLowerCase();
  if (!VALID_BOX_ROLES.includes(trimmed as (typeof VALID_BOX_ROLES)[number])) {
    throw new Error(ValidatorErrors.boxRoleInvalid(node.type, node.lineNumber, value.trim()));
  }
};
