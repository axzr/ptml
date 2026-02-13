import type { Node } from '../../types';
import { ValidatorErrors } from '../../errors/messages';
import { matchListBinding, matchSimpleListName } from '../../utils/regexPatterns';

export const validateListNameWithOptionalBinding = (value: string, node: Node): void => {
  const trimmed = value.trim();
  const binding = matchListBinding(trimmed);
  if (binding) {
    const itemVariableName = binding.variableName;
    if (!itemVariableName.startsWith('$')) {
      throw new Error(ValidatorErrors.listNameBindingVariableName(node.type, node.lineNumber, itemVariableName));
    }
    if (itemVariableName.includes(' ')) {
      throw new Error(ValidatorErrors.listNameBindingInvalidSyntax(node.type, node.lineNumber, trimmed));
    }
  } else {
    const listName = matchSimpleListName(trimmed);
    if (!listName) {
      throw new Error(ValidatorErrors.listNameBindingInvalidSyntax(node.type, node.lineNumber, trimmed));
    }
  }
};
