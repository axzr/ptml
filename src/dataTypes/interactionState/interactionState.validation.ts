import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ValidatorErrors } from '../../errors/messages';
import { INTERACTION_STATES } from '../../styles/interactionStates';

export const validateInteractionState = (value: string, node: Node, _context?: ValidationContext): void => {
  const trimmed = (value ?? '').trim();
  if (!INTERACTION_STATES.includes(trimmed)) {
    throw new Error(
      ValidatorErrors.interactionStateInvalid(node.lineNumber, trimmed || '(empty)', INTERACTION_STATES.join(', ')),
    );
  }
};
