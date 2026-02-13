import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { parseStateValue } from '../state/state';
import type { Node } from '../types';
import type { LoopVariablesMap, StateValue } from '../state/state';
import type { ExecutionContext, FunctionMap } from '../types';

export const buildFunctionMap = (nodes: Node[]): FunctionMap => {
  const functions: FunctionMap = {};

  nodes.forEach((node) => {
    if (node.type === 'function' && node.data) {
      const parts = node.data.trim().split(/\s+/);
      if (parts.length > 0) {
        const functionName = parts[0];
        functions[functionName] = node;
      }
    }
  });

  return functions;
};

export const parseArguments = (node: Node): string[] => {
  if (!node.data) {
    return [];
  }
  const parts = node.data.trim().split(/\s+/);
  return parts.slice(1);
};

const bindArgumentsToParameters = (
  parameters: string[],
  callArgs: string[],
  context: ExecutionContext,
): LoopVariablesMap => {
  const boundParams: LoopVariablesMap = {};

  for (let i = 0; i < parameters.length; i++) {
    const paramName = parameters[i];
    const argText = callArgs[i] || '';

    if (argText.startsWith('$')) {
      const varName = argText.slice(1);
      if (context.loopVariables && varName in context.loopVariables) {
        boundParams[paramName] = context.loopVariables[varName];
      } else if (varName in context.state) {
        boundParams[paramName] = context.state[varName];
      } else {
        boundParams[paramName] = 0;
      }
    } else {
      boundParams[paramName] = parseStateValue(argText);
    }
  }

  return boundParams;
};

export const executeChildNode = (child: Node, context: ExecutionContext): void => {
  const schema = getSchemaMap().get(child.type);
  const processor: ((child: Node, context: ExecutionContext) => void) | undefined = schema?.functions.execute;
  if (processor) {
    processor(child, context);
  }
};

const executeFunctionBody = (functionNode: Node, functionParams: LoopVariablesMap, context: ExecutionContext): void => {
  const functionContext: ExecutionContext = {
    ...context,
    loopVariables: functionParams,
  };

  functionNode.children.forEach((child) => {
    executeChildNode(child, functionContext);
  });
};

const resolveFunctionName = (functionName: string, context: ExecutionContext): string => {
  if (functionName.startsWith('$')) {
    const varName = functionName.slice(1);
    let value: StateValue | undefined;

    if (context.loopVariables && varName in context.loopVariables) {
      value = context.loopVariables[varName];
    } else if (varName in context.state) {
      value = context.state[varName];
    }

    if (value !== undefined && value !== null) {
      return String(value);
    }
  }
  return functionName;
};

export const executeFunctionCall = (callNode: Node, context: ExecutionContext): void => {
  if (!callNode.data || !context.functionMap) {
    return;
  }

  const parts = callNode.data.trim().split(/\s+/);
  const rawFunctionName = parts[0];
  const functionName = resolveFunctionName(rawFunctionName, context);
  const functionNode = context.functionMap[functionName];

  if (!functionNode) {
    return;
  }

  const parameters = parseArguments(functionNode);
  const callArguments = parseArguments(callNode);

  if (parameters.length !== callArguments.length) {
    throw new Error(
      `Function call on line ${callNode.lineNumber} calls function "${functionName}" with ${callArguments.length} argument(s), but the function expects ${parameters.length} parameter(s).`,
    );
  }

  const functionParams = bindArgumentsToParameters(parameters, callArguments, context);

  executeFunctionBody(functionNode, functionParams, context);
};
