import { matchRangeBinding } from '../../utils/regexPatterns';
import { executeChildNode } from '../../evaluation/functionOperations';
import type { Node } from '../../types';
import type { StateMap, LoopVariablesMap } from '../../state/state';
import type { ExecutionContext } from '../../types';

const parseRangeData = (data: string): { stateVariable: string; indexVariable: string } | null => {
  const binding = matchRangeBinding(data);
  if (!binding) {
    return null;
  }
  return {
    stateVariable: binding.stateVar,
    indexVariable: binding.indexVar,
  };
};

const getRangeMaxValue = (stateVariable: string, state: StateMap): number | null => {
  const stateValue = state[stateVariable];

  if (stateValue === undefined || stateValue === null) {
    return null;
  }

  const numericValue = typeof stateValue === 'number' ? stateValue : Number(stateValue);
  if (isNaN(numericValue) || numericValue < 0) {
    return null;
  }

  return Math.floor(numericValue);
};

const executeRangeIteration = (
  rangeNode: Node,
  indexVariable: string,
  maxValue: number,
  functionParams: LoopVariablesMap,
  context: ExecutionContext,
): void => {
  for (let i = 0; i < maxValue; i++) {
    const rangeLoopVariables: LoopVariablesMap = {
      ...functionParams,
      [indexVariable]: i,
    };

    const rangeContext: ExecutionContext = {
      ...context,
      loopVariables: rangeLoopVariables,
    };

    rangeNode.children.forEach((child) => {
      executeChildNode(child, rangeContext);
    });
  }
};

export const executeRangeNode = (rangeNode: Node, context: ExecutionContext): void => {
  if (!rangeNode.data) return;

  const parsed = parseRangeData(rangeNode.data);
  if (!parsed) return;

  const maxValue = getRangeMaxValue(parsed.stateVariable, context.state);
  if (maxValue === null) return;

  const functionParams = context.loopVariables || {};
  executeRangeIteration(rangeNode, parsed.indexVariable, maxValue, functionParams, context);
};
