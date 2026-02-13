import type { Node } from '../../types';
import type { ValidationContext } from '../types';
import {
  isInsideManagedLoop,
  isInsideFunction,
  getFunctionParameters,
  isInsideTemplate,
  getTemplateParameters,
  checkLoopVariableInStack,
} from './helpers';
import { extractAllVariableReferences } from '../../utils/regexPatterns';
import { VariableErrors } from '../../errors/messages';

const validatePipeExpressionVariable = (
  varRef: string,
  node: Node,
  context: ValidationContext,
  isInLoop: boolean,
  functionParameters: string[],
  templateParameters: string[],
  isInFunction: boolean,
  isInTemplate: boolean,
): void => {
  const isStateVariable = context.stateMap && varRef in context.stateMap;
  const isLoopVariable = isInLoop && checkLoopVariableInStack(varRef, context.stack);
  const isListVariable = context.listMap && varRef in context.listMap;
  const isFunctionParameter = isInFunction && functionParameters.includes(varRef);
  const isTemplateParameter = isInTemplate && templateParameters.includes(varRef);

  if (isStateVariable || isLoopVariable || isListVariable || isFunctionParameter || isTemplateParameter) {
    return;
  }

  if (varRef.includes('.')) {
    const baseVarRef = varRef.split('.')[0];
    const isBaseLoopVariable = isInLoop && checkLoopVariableInStack(baseVarRef, context.stack);
    const isBaseTemplateParameter = isInTemplate && templateParameters.includes(baseVarRef);
    if (isBaseLoopVariable || isBaseTemplateParameter) {
      return;
    }
  }

  throw new Error(VariableErrors.undefinedVariableInExpression(node.type, node.lineNumber, varRef));
};

export const validatePipeExpression = (value: string, node: Node, context?: ValidationContext): void => {
  if (!value || !value.trim()) {
    return;
  }

  if (!context) {
    return;
  }

  const variableReferences = extractAllVariableReferences(value);
  const isInLoop = isInsideManagedLoop(context.stack);
  const isInFunction = isInsideFunction(context.stack);
  const functionParameters = getFunctionParameters(context.stack);
  const isInTemplate = isInsideTemplate(context.stack);
  const templateParameters = getTemplateParameters(context.stack);

  for (const varRef of variableReferences) {
    validatePipeExpressionVariable(
      varRef,
      node,
      context,
      isInLoop,
      functionParameters,
      templateParameters,
      isInFunction,
      isInTemplate,
    );
  }
};
