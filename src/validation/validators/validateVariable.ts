import type { Node } from '../../types';
import type { NodeSchema } from '../../schemas/types';
import type { ValidationContext } from '../types';
import { parse } from '../../parsers/parser';
import {
  isInsideManagedLoop,
  isInsideFunction,
  getFunctionParameters,
  isInsideTemplate,
  getTemplateParameters,
  checkLoopVariableInStack,
  isInsideNamedStyleDefinition,
} from './helpers';
import { VariableErrors } from '../../errors/messages';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { inferLoopVariableExtractor } from './validateLoopVariables';

const extractLoopVariablesFromNode = (n: Node, schema: NodeSchema): string[] => {
  const extractor = inferLoopVariableExtractor(schema);
  if (!extractor || !n.data) {
    return [];
  }
  return extractor(n.data);
};

const checkNodeForLoopVariable = (n: Node, varRef: string, schemaMap: Map<string, NodeSchema>): boolean => {
  const schema = schemaMap.get(n.type);
  if (schema?.managesLoopVariables) {
    const vars = extractLoopVariablesFromNode(n, schema);
    if (vars.includes(varRef)) {
      return true;
    }
  }
  return n.children?.some((child) => checkNodeForLoopVariable(child, varRef, schemaMap)) || false;
};

const checkIfLoopVariableExistsInDocument = (varRef: string, context: ValidationContext): boolean => {
  if (!context.lines) {
    return false;
  }
  try {
    const nodes = parse(context.lines.join('\n'));
    const schemaMap = getSchemaMap();
    return nodes.some((node) => checkNodeForLoopVariable(node, varRef, schemaMap));
  } catch (error) {
    return false;
  }
};

const isRootLevelNamedStyle = (context: ValidationContext): boolean => {
  const isInNamedStyleDef = isInsideNamedStyleDefinition(context.stack);
  const isInLoop = isInsideManagedLoop(context.stack);
  if (
    !isInNamedStyleDef ||
    isInLoop ||
    !context.stack ||
    context.stack.length === 0 ||
    context.stack[0].type !== 'define'
  ) {
    return false;
  }

  const schemaMap = getSchemaMap();
  return !context.stack.some((e, idx) => {
    if (idx === 0) {
      return false;
    }

    const schema = schemaMap.get(e.type);
    if (!schema) {
      return false;
    }

    const isLoopNode = schema.managesLoopVariables;
    const isDeclarationWithParameters = schema.category === 'declaration' && schema.data?.format?.rest !== undefined;
    const isRenderableBlock = schema.isRenderable;

    return isLoopNode || isDeclarationWithParameters || isRenderableBlock;
  });
};

const validateKnownLoopVariable = (varRef: string, node: Node, context: ValidationContext): void => {
  const isInLoop = isInsideManagedLoop(context.stack);

  if (!isInLoop) {
    const isRootNamedStyle = isRootLevelNamedStyle(context);

    if (!isRootNamedStyle) {
      throw new Error(VariableErrors.loopVariableOutsideContext(node.type, node.lineNumber, varRef));
    }

    const loopVariableExistsInDoc = checkIfLoopVariableExistsInDocument(varRef, context);
    if (!loopVariableExistsInDoc) {
      throw new Error(VariableErrors.loopVariableOutsideContext(node.type, node.lineNumber, varRef));
    }
  }
};

const checkNestedPropertyAccess = (
  baseVarRef: string,
  isInLoop: boolean,
  context: ValidationContext,
  templateParameters: string[],
  isInTemplate: boolean,
): boolean => {
  const isBaseLoopVariable = !!(isInLoop && checkLoopVariableInStack(baseVarRef, context.stack));
  const isBaseTemplateParameter = isInTemplate && templateParameters.includes(baseVarRef);
  const isRootNamedStyle = isRootLevelNamedStyle(context);
  const isBaseLoopVariableInGlobalSet =
    isRootNamedStyle && context.loopVariables && context.loopVariables.has(baseVarRef)
      ? checkIfLoopVariableExistsInDocument(baseVarRef, context)
      : false;
  return isBaseLoopVariable || isBaseTemplateParameter || isBaseLoopVariableInGlobalSet;
};

const checkDirectVariableAccess = (
  varRef: string,
  context: ValidationContext,
  isInLoop: boolean,
  functionParameters: string[],
  templateParameters: string[],
  isInFunction: boolean,
  isInTemplate: boolean,
): boolean => {
  const isStateVariable = !!(context.stateMap && varRef in context.stateMap);
  const isLoopVariable = !!(isInLoop && checkLoopVariableInStack(varRef, context.stack));
  const isListVariable = !!(context.listMap && varRef in context.listMap);
  const isFunctionParameter = isInFunction && functionParameters.includes(varRef);
  const isTemplateParameter = isInTemplate && templateParameters.includes(varRef);
  const isRootNamedStyle = isRootLevelNamedStyle(context);
  const isLoopVariableInGlobalSet =
    isRootNamedStyle && context.loopVariables && context.loopVariables.has(varRef)
      ? checkIfLoopVariableExistsInDocument(varRef, context)
      : false;

  return (
    isStateVariable ||
    isLoopVariable ||
    isListVariable ||
    isFunctionParameter ||
    isTemplateParameter ||
    isLoopVariableInGlobalSet
  );
};

const checkVariableValidity = (varRef: string, context: ValidationContext, isInLoop: boolean): boolean => {
  const isInFunction = isInsideFunction(context.stack);
  const functionParameters = getFunctionParameters(context.stack);
  const isInTemplate = isInsideTemplate(context.stack);
  const templateParameters = getTemplateParameters(context.stack);

  if (
    checkDirectVariableAccess(
      varRef,
      context,
      isInLoop,
      functionParameters,
      templateParameters,
      isInFunction,
      isInTemplate,
    )
  ) {
    return true;
  }

  if (varRef.includes('.')) {
    const baseVarRef = varRef.split('.')[0];
    return checkNestedPropertyAccess(baseVarRef, isInLoop, context, templateParameters, isInTemplate);
  }

  return false;
};

const validateLoopVariableNotInContext = (
  varRef: string,
  node: Node,
  context: ValidationContext,
  isInLoop: boolean,
): void => {
  const isRootNamedStyle = isRootLevelNamedStyle(context);
  const isLoopVariableButNotInLoopContext =
    !isInLoop && !isRootNamedStyle && context.loopVariables && context.loopVariables.has(varRef);

  if (isLoopVariableButNotInLoopContext) {
    throw new Error(
      `${node.type} node on line ${node.lineNumber} references loop variable $${varRef} outside of loop context. Loop variables can only be used inside their defining loop or in root-level named styles that will be used within loops.`,
    );
  }
};

export const validateIfVariableExists = (varRef: string, node: Node, context: ValidationContext): void => {
  const isInLoop = isInsideManagedLoop(context.stack);
  const isLoopVariable =
    (context.loopVariables?.has(varRef) ?? false) || (isInLoop && checkLoopVariableInStack(varRef, context.stack));

  if (isLoopVariable) {
    validateKnownLoopVariable(varRef, node, context);
  }

  validateLoopVariableNotInContext(varRef, node, context, isInLoop);

  const isValid = checkVariableValidity(varRef, context, isInLoop);

  if (!isValid) {
    throw new Error(VariableErrors.undefinedStateVariable(node.type, node.lineNumber, varRef));
  }
};

export const validateVariable = (
  varName: string,
  context: ValidationContext,
): {
  isStateVariable: boolean;
  isLoopVariable: boolean;
  isListVariable: boolean;
  isFunctionParameter: boolean;
  isTemplateParameter: boolean;
  isInLoop: boolean;
} => {
  const isInLoop = isInsideManagedLoop(context.stack);
  const isInFunction = isInsideFunction(context.stack);
  const functionParameters = getFunctionParameters(context.stack);
  const isInTemplate = isInsideTemplate(context.stack);
  const templateParameters = getTemplateParameters(context.stack);

  const isStateVariable = !!(context.stateMap && varName in context.stateMap);
  const isLoopVariable = !!(isInLoop && checkLoopVariableInStack(varName, context.stack));
  const isListVariable = !!(context.listMap && varName in context.listMap);
  const isFunctionParameter = isInFunction && functionParameters.includes(varName);
  const isTemplateParameter = isInTemplate && templateParameters.includes(varName);

  return {
    isStateVariable,
    isLoopVariable,
    isListVariable,
    isFunctionParameter,
    isTemplateParameter,
    isInLoop,
  };
};
