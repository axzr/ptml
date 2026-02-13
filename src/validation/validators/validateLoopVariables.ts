import { extractLoopVariablesFromEachData } from '../../utils/loopVariables';
import { VariableErrors } from '../../errors/messages';
import { extractLoopVariablesFromRangeData } from '../../utils/regexPatterns';
import type { NodeSchema } from '../../schemas/types';
import type { StateMap } from '../../state/state';

export const inferLoopVariableExtractor = (schema: NodeSchema): ((data: string) => string[]) | null => {
  const dataFormat = schema.data.format;
  if (!dataFormat) {
    return null;
  }

  if (dataFormat.separator === 'comma' && dataFormat.second) {
    return extractLoopVariablesFromEachData;
  }

  if (dataFormat.separator === 'comma' && dataFormat.first && dataFormat.first.format?.validator === 'range-binding') {
    return extractLoopVariablesFromRangeData;
  }

  return null;
};

export const validateLoopVariableConflicts = (
  loopVariables: string[],
  nodeType: string,
  lineNumber: number,
  stateMap: StateMap | undefined,
): void => {
  if (!stateMap) {
    return;
  }

  for (const variableName of loopVariables) {
    if (variableName in stateMap) {
      throw new Error(VariableErrors.loopVariableConflict(nodeType, lineNumber, variableName));
    }
  }
};
