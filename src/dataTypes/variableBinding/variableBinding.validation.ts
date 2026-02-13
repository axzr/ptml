import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { ValidatorErrors, VariableErrors } from '../../errors/messages';
import { matchVariableBinding } from '../../utils/regexPatterns';

export const validateVariableBindingValue = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  const variableName = matchVariableBinding(trimmed);
  if (!variableName) {
    throw new Error(ValidatorErrors.invalidVariableBinding(node.type, node.lineNumber, trimmed));
  }
  if (context && context.stateMap && variableName in context.stateMap) {
    throw new Error(VariableErrors.variableBindingConflict(node.type, node.lineNumber, variableName));
  }
};
