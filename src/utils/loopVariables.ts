import { matchIndexBinding, matchItemVariableBinding } from './regexPatterns';

export const extractLoopVariablesFromEachData = (data: string): string[] => {
  const parts = data.split(',').map((part) => part.trim());
  const loopVars: string[] = [];

  if (parts.length > 0) {
    const itemVar = matchItemVariableBinding(parts[0]);
    if (itemVar) {
      loopVars.push(itemVar);
    }
  }

  if (parts.length > 1) {
    const indexVar = matchIndexBinding(parts[1]);
    if (indexVar) {
      loopVars.push(indexVar);
    }
  }

  return loopVars;
};
