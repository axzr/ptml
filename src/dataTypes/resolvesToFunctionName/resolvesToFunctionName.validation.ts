import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import {
  isInsideManagedLoop,
  isInsideFunction,
  getFunctionParameters,
  isInsideTemplate,
  getTemplateParameters,
  checkLoopVariableInStack,
} from '../../validation/validators/helpers';
import { ValidatorErrors, VariableErrors } from '../../errors/messages';

export const validateResolvesToFunctionName = (value: string, node: Node, context?: ValidationContext): void => {
  if (!context) {
    return;
  }

  const functionName = value.trim();
  if (!functionName.startsWith('$')) {
    if (context.functionMap && !(functionName in context.functionMap)) {
      throw new Error(ValidatorErrors.undefinedFunction(node.type, node.lineNumber, functionName));
    }
    return;
  }

  const varName = functionName.slice(1);
  const isInLoop = isInsideManagedLoop(context.stack);
  const isInFunction = isInsideFunction(context.stack);
  const functionParameters = getFunctionParameters(context.stack);
  const isInTemplate = isInsideTemplate(context.stack);
  const templateParameters = getTemplateParameters(context.stack);

  const isStateVariable = context.stateMap && varName in context.stateMap;
  const isLoopVariable = isInLoop && checkLoopVariableInStack(varName, context.stack);
  const isListVariable = context.listMap && varName in context.listMap;
  const isFunctionParameter = isInFunction && functionParameters.includes(varName);
  const isTemplateParameter = isInTemplate && templateParameters.includes(varName);

  if (!isStateVariable && !isLoopVariable && !isListVariable && !isFunctionParameter && !isTemplateParameter) {
    throw new Error(VariableErrors.undefinedVariable(node.type, node.lineNumber, varName));
  }
};
