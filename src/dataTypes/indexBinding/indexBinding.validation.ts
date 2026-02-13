import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';
import { matchIndexBinding } from '../../utils/regexPatterns';

export const validateIndexBinding = (value: string, node: Node): void => {
  const trimmed = value.trim();
  const indexVariableName = matchIndexBinding(trimmed);
  if (indexVariableName) {
    const indexAsIndex = trimmed.indexOf('index as ');
    if (indexAsIndex !== -1) {
      const afterAs = trimmed.slice(indexAsIndex + 'index as '.length);
      if (!afterAs.startsWith('$')) {
        throw new Error(ValidatorErrors.indexBindingVariableName(node.type, node.lineNumber, indexVariableName));
      }
    }
  } else {
    throw new Error(ValidatorErrors.indexBindingInvalidSyntax(node.type, node.lineNumber, trimmed));
  }
};
