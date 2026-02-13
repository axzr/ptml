import type { Node } from '../../types';
import { VariableErrors } from '../../errors/messages';

export const validateVariableName = (value: string, node: Node): void => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('$')) {
    throw new Error(VariableErrors.variableNameMustStartWithDollar(node.type, node.lineNumber, trimmed));
  }
};
