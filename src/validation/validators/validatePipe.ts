import type { Node } from '../../types';
import type { ValidationContext } from '../types';
import {
  isInsideManagedLoop,
  isInsideFunction,
  getFunctionParameters,
  isInsideTemplate,
  getTemplateParameters,
  checkLoopVariableInStack,
  isFormFieldReference,
  isKnownFormField,
  getFormFieldName,
  describeDeclaredFieldIds,
} from './helpers';
import { extractAllVariableReferences } from '../../utils/regexPatterns';
import { FormStateErrors, VariableErrors } from '../../errors/messages';

const isKnownVariable = (
  varRef: string,
  context: ValidationContext,
  isInLoop: boolean,
  functionParameters: string[],
  templateParameters: string[],
  isInFunction: boolean,
  isInTemplate: boolean,
): boolean =>
  Boolean(context.stateMap && varRef in context.stateMap) ||
  Boolean(isInLoop && checkLoopVariableInStack(varRef, context.stack)) ||
  Boolean(context.listMap && varRef in context.listMap) ||
  (isInFunction && functionParameters.includes(varRef)) ||
  (isInTemplate && templateParameters.includes(varRef));

const validateFormFieldReference = (varRef: string, node: Node, context: ValidationContext): void => {
  if (isKnownFormField(varRef, context)) {
    return;
  }
  throw new Error(
    FormStateErrors.unknownFormField(
      node.type,
      node.lineNumber,
      getFormFieldName(varRef),
      describeDeclaredFieldIds(context),
    ),
  );
};

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
  if (isKnownVariable(varRef, context, isInLoop, functionParameters, templateParameters, isInFunction, isInTemplate)) {
    return;
  }

  if (isFormFieldReference(varRef)) {
    validateFormFieldReference(varRef, node, context);
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
