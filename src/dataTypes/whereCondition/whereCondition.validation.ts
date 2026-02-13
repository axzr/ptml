import { extractAllVariableReferences } from '../../utils/regexPatterns';
import { ValidatorErrors } from '../../errors/messages';
import { matchWhereCondition } from '../../utils/regexPatterns';
import { validateIfVariableExists } from '../../validation/validators/validateVariable';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';

const validateWhereConditionParts = (node: Node, propertyName: string, matchValueText: string): void => {
  if (!propertyName) {
    throw new Error(ValidatorErrors.whereConditionPropertyName(node.type, node.lineNumber));
  }

  if (!matchValueText) {
    throw new Error(ValidatorErrors.whereConditionMatchValue(node.type, node.lineNumber));
  }
};

const validateWhereConditionVariables = (matchValueText: string, node: Node, context?: ValidationContext): void => {
  if (matchValueText.startsWith('$') && context) {
    const variableReferences = extractAllVariableReferences(matchValueText);
    for (const varRef of variableReferences) {
      validateIfVariableExists(varRef, node, context);
    }
  }
};

export const validateWhereCondition = (value: string, node: Node, context?: ValidationContext): void => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(ValidatorErrors.whereConditionRequired(node.type, node.lineNumber));
  }

  const whereMatch = matchWhereCondition(trimmed);
  if (!whereMatch) {
    throw new Error(ValidatorErrors.whereConditionInvalidFormat(node.type, node.lineNumber, trimmed));
  }

  const propertyName = whereMatch.propertyName;
  const matchValueText = whereMatch.matchValue;

  validateWhereConditionParts(node, propertyName, matchValueText);
  validateWhereConditionVariables(matchValueText, node, context);
};
