import { ValidatorErrors } from '../../errors/messages';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { extractAllVariableReferences, splitOnWhitespace } from '../../utils/regexPatterns';
import type { Node } from '../../types';
import type { StateMap } from '../../state/state';
import type { SemanticStackEntry, ValidationContext } from '../types';

const EXPRESSION_PATTERN = /\(([^)]+)\)/g;

export const isInsideManagedLoop = (stack: SemanticStackEntry[]): boolean => {
  const schemaMap = getSchemaMap();
  return stack.some((entry) => {
    const schema = schemaMap.get(entry.type);
    return schema?.managesLoopVariables;
  });
};

export const isInsideNamedStyleDefinition = (stack?: SemanticStackEntry[]): boolean => {
  if (!stack || stack.length === 0) {
    return false;
  }
  return stack[0].type === 'define';
};

export const checkVariableExists = (
  varRef: string,
  stateMap: StateMap,
  isInLoop: boolean,
  isInNamedStyle: boolean,
  context?: ValidationContext,
): boolean => {
  if (isInLoop) {
    return true;
  }
  if (varRef in stateMap) {
    return true;
  }
  if (isInNamedStyle && context) {
    const isRootStyleDefinition = context.stack && context.stack.length > 0 && context.stack[0].type === 'define';
    if (isRootStyleDefinition && context.loopVariables && context.loopVariables.has(varRef)) {
      return true;
    }
    if (!isRootStyleDefinition && context.stack && checkLoopVariableInStack(varRef, context.stack)) {
      return true;
    }
  }
  return false;
};

const VALID_PIPE_FUNCTIONS = new Set(['add', 'subtract', 'multiply', 'divide', 'length']);

const extractPipeExpressions = (expression: string): Array<{ functionName: string; fullExpression: string }> => {
  const pipeExpressions: Array<{ functionName: string; fullExpression: string }> = [];
  const expressionRegex = EXPRESSION_PATTERN;
  let match;

  while ((match = expressionRegex.exec(expression)) !== null) {
    const fullExpression = match[0];
    const content = match[1].trim();
    const pipeIndex = content.lastIndexOf('|');
    if (pipeIndex !== -1) {
      const functionPart = content.slice(pipeIndex + 1).trim();
      const functionParts = splitOnWhitespace(functionPart);
      if (functionParts.length > 0) {
        const functionName = functionParts[functionParts.length - 1];
        pipeExpressions.push({ functionName, fullExpression });
      }
    }
  }

  return pipeExpressions;
};

export const validatePipeFunctions = (valueExpression: string, lineNumber: number, nodeType: string): void => {
  const pipeExpressions = extractPipeExpressions(valueExpression);
  for (const { functionName, fullExpression } of pipeExpressions) {
    if (!VALID_PIPE_FUNCTIONS.has(functionName)) {
      throw new Error(
        ValidatorErrors.unknownPipeFunction(
          nodeType,
          lineNumber,
          functionName,
          fullExpression,
          Array.from(VALID_PIPE_FUNCTIONS).join(', '),
        ),
      );
    }
  }
};

export const checkLoopVariableInStack = (varName: string, stack: SemanticStackEntry[]): boolean => {
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (entry.loopVariables && Array.isArray(entry.loopVariables) && entry.loopVariables.includes(varName)) {
      return true;
    }
  }
  return false;
};

export const checkSiblingBindingInStack = (varName: string, stack: SemanticStackEntry[]): boolean => {
  for (let i = stack.length - 1; i >= 0; i--) {
    const entry = stack[i];
    if (entry.siblingBindings && Array.isArray(entry.siblingBindings) && entry.siblingBindings.includes(varName)) {
      return true;
    }
  }
  return false;
};

export const checkVariableExistsInContext = (varName: string, context: ValidationContext): boolean => {
  const isInManagedLoop = context.stack ? isInsideManagedLoop(context.stack) : false;
  const isStateVariable = !!(context.stateMap && varName in context.stateMap);

  let isLoopVariable = false;
  if (isInManagedLoop && context.stack) {
    isLoopVariable = checkLoopVariableInStack(varName, context.stack);
  }

  const isSiblingBinding = context.stack ? checkSiblingBindingInStack(varName, context.stack) : false;
  const isListVariable = !!(context.listMap && varName in context.listMap);

  return isStateVariable || isLoopVariable || isSiblingBinding || isListVariable;
};

const validateNumericIndex = (index: string, node: Node, nodeType: string): void => {
  const numericIndex = Number(index);
  if (isNaN(numericIndex) || numericIndex < 0) {
    throw new Error(
      `${nodeType} node on line ${node.lineNumber} has invalid index "${index}". Index must be a non-negative number or a variable reference starting with $.`,
    );
  }
};

export const validateIndexExpression = (
  index: string,
  node: Node,
  context: ValidationContext,
  nodeType: string,
): void => {
  if (index.startsWith('$')) {
    const varName = index.slice(1);
    if (!checkVariableExistsInContext(varName, context)) {
      throw new Error(
        `${nodeType} node on line ${node.lineNumber} references undefined variable $${varName} for index. Ensure the variable is defined in state, available in the current loop context, or is a list name.`,
      );
    }
  } else {
    validateNumericIndex(index, node, nodeType);
  }
};

export const checkListExists = (listName: string, context: ValidationContext): boolean => {
  const listExistsInListMap = context.listMap && listName in context.listMap;
  const listExistsInState =
    context.stateMap && listName in context.stateMap && Array.isArray(context.stateMap[listName]);
  return !!(listExistsInListMap || listExistsInState);
};

export const isInsideFunction = (stack: SemanticStackEntry[]): boolean => {
  return stack.some((entry) => entry.type === 'function');
};

export const getFunctionParameters = (stack: SemanticStackEntry[]): string[] => {
  const functionEntry = stack.find((entry) => entry.type === 'function');
  return functionEntry?.functionParameters || [];
};

export const isInsideTemplate = (stack: SemanticStackEntry[]): boolean => {
  return stack.some((entry) => entry.type === 'template');
};

export const getTemplateParameters = (stack: SemanticStackEntry[]): string[] => {
  const templateEntry = stack.find((entry) => entry.type === 'template');
  return templateEntry?.templateParameters || [];
};

export const validateValueExpressionVariables = (
  valueExpression: string,
  node: Node,
  context: ValidationContext,
  nodeType: string,
): void => {
  if (!context.stateMap || !context.stack) {
    return;
  }

  const isInManagedLoop = isInsideManagedLoop(context.stack);
  const variableReferences = extractAllVariableReferences(valueExpression);

  for (const varRef of variableReferences) {
    const isStateVariable = varRef in context.stateMap;
    const isLoopVariable = isInManagedLoop && checkLoopVariableInStack(varRef, context.stack);
    const isListVariable = context.listMap && varRef in context.listMap;

    if (!isStateVariable && !isLoopVariable && !isListVariable) {
      throw new Error(
        `${nodeType} node on line ${node.lineNumber} references undefined variable $${varRef}. Ensure the variable is defined in state, available in the current loop context, or is a list name.`,
      );
    }
  }
};
