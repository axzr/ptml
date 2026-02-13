import { matchRangeBinding, matchSimpleListName, matchIndexBinding } from '../utils/regexPatterns';

const matchEachListBinding = (text: string): { listName: string; itemVariableName: string } | null => {
  const binding = matchRangeBinding(text);
  if (!binding) {
    return null;
  }
  return {
    listName: binding.stateVar.startsWith('$') ? binding.stateVar.slice(1) : binding.stateVar,
    itemVariableName: binding.indexVar.startsWith('$') ? binding.indexVar.slice(1) : binding.indexVar,
  };
};

const parseListNameAndItem = (firstPart: string): { listName: string; itemVariableName?: string } | null => {
  const binding = matchEachListBinding(firstPart);
  if (binding) {
    return binding;
  }

  const listName = matchSimpleListName(firstPart);
  if (!listName) {
    return null;
  }

  return {
    listName: listName.startsWith('$') ? listName.slice(1) : listName,
  };
};

export const parseEachNodeData = (
  data: string,
): { listName: string; itemVariableName?: string; indexVariableName?: string } | null => {
  const parts = data.split(',').map((part) => part.trim());
  if (parts.length === 0) {
    return null;
  }

  const parsed = parseListNameAndItem(parts[0]);
  if (!parsed) {
    return null;
  }

  let indexVariableName: string | undefined;
  if (parts.length === 2) {
    const indexVar = matchIndexBinding(parts[1]);
    if (indexVar) {
      indexVariableName = indexVar.startsWith('$') ? indexVar.slice(1) : indexVar;
    }
  }

  return { ...parsed, indexVariableName };
};
