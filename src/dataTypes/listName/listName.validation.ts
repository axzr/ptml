import type { Node } from '../../types';
import { ListErrors } from '../../errors/messages';

export const validateListName = (value: string, node: Node): void => {
  const trimmed = value.trim();
  if (!trimmed || trimmed.includes(' ')) {
    throw new Error(ListErrors.invalidListName(node.type, node.lineNumber, trimmed));
  }
};
