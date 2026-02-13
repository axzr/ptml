import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { VariableErrors } from '../../errors/messages';
import { validateVariable } from '../../validation/validators/validateVariable';

export const validateVariableReference = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (!trimmed.startsWith('$')) {
    throw new Error(VariableErrors.variableReferenceMustStartWithDollar(node.type, node.lineNumber, trimmed));
  }

  if (!context) {
    return;
  }

  const varName = trimmed.slice(1);
  const { isStateVariable, isLoopVariable, isListVariable, isFunctionParameter, isTemplateParameter } =
    validateVariable(varName, context);

  if (!isStateVariable && !isLoopVariable && !isListVariable && !isFunctionParameter && !isTemplateParameter) {
    throw new Error(VariableErrors.undefinedVariable(node.type, node.lineNumber, varName));
  }
};
