import { ValidatorErrors } from '../../errors/messages';
import { extractAllVariableReferences, matchIsCondition, splitOnWhitespace } from '../../utils/regexPatterns';
import { validateIfVariableExists } from '../../validation/validators/validateVariable';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';

const validateIfComparisonCondition = (trimmed: string, node: Node, context?: ValidationContext): void => {
  const condition = matchIsCondition(trimmed);
  if (!condition) {
    return;
  }

  const variablePart = condition.left;
  if (!variablePart.startsWith('$')) {
    throw new Error(ValidatorErrors.ifConditionComparisonVariableName(node.type, node.lineNumber, variablePart));
  }

  if (context) {
    const variableReferences = extractAllVariableReferences(trimmed);
    for (const varRef of variableReferences) {
      validateIfVariableExists(varRef, node, context);
    }

    const rightHandSide = condition.right;
    if (rightHandSide.startsWith('$')) {
      const rightVarRef = rightHandSide.slice(1);
      validateIfVariableExists(rightVarRef, node, context);
    }
  }
};

const validateIfSimpleCondition = (trimmed: string, node: Node, context?: ValidationContext): void => {
  const parts = splitOnWhitespace(trimmed);
  if (parts.length !== 1) {
    return;
  }

  if (!parts[0].startsWith('$')) {
    throw new Error(ValidatorErrors.ifConditionVariableName(node.type, node.lineNumber, parts[0]));
  }

  if (context) {
    const varName = parts[0].slice(1);
    validateIfVariableExists(varName, node, context);
  }
};

export const validateIfCondition = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(ValidatorErrors.ifConditionRequired(node.type, node.lineNumber));
  }

  if (trimmed.includes(' is ')) {
    validateIfComparisonCondition(trimmed, node, context);
  } else {
    validateIfSimpleCondition(trimmed, node, context);
  }
};
