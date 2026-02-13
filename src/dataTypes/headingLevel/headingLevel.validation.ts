import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';

export const validateHeadingLevel = (value: string, node: Node): void => {
  const trimmed = value.trim().toLowerCase();
  const validLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validLevels.includes(trimmed)) {
    throw new Error(ValidatorErrors.headingLevelInvalid(node.type, node.lineNumber, value.trim()));
  }
};
