export const extractAllVariableReferences = (text: string): string[] => {
  const matches = text.match(/\$([A-Za-z0-9_.-]+)/g);
  if (!matches) {
    return [];
  }
  return matches.map((match) => match.slice(1));
};

export const matchSingleVariableReference = (text: string): string | null => {
  const match = text.match(/^\$([A-Za-z0-9_.-]+)$/);
  return match ? match[1] : null;
};

export const removeCategoryPrefix = (text: string): string => {
  return text.replace(/^[->?]\s*/, '');
};

export const removeAllPrefixes = (text: string): string => {
  return text.replace(/^[>?\-!]*\s*/, '');
};

export const matchListBinding = (text: string): { listName: string; variableName: string } | null => {
  const match = text.match(/^(\$?[\w.-]+)\s+as\s+(.+)$/);
  if (!match) {
    return null;
  }
  return {
    listName: match[1],
    variableName: match[2].trim(),
  };
};

export const matchRangeBinding = (text: string): { stateVar: string; indexVar: string } | null => {
  const match = text.match(/^(\$?[\w.-]+)\s+as\s+\$?([\w.-]+)$/);
  if (!match) {
    return null;
  }
  return {
    stateVar: match[1],
    indexVar: match[2],
  };
};

export const matchIndexBinding = (text: string): string | null => {
  const match = text.match(/^index\s+as\s+\$?([\w.-]+)$/);
  return match ? match[1] : null;
};

export const matchVariableBinding = (text: string): string | null => {
  const match = text.match(/^as\s+\$?([\w.-]+)$/);
  return match ? match[1] : null;
};

export const matchItemVariableBinding = (text: string): string | null => {
  const match = text.match(/^[\w.-]+\s+as\s+\$?([\w.-]+)$/);
  return match ? match[1] : null;
};

export const parseListDeclarationWithColon = (nodeType: string, text: string): string | null => {
  const regex = new RegExp(`^${nodeType}:\\s?(.*)$`);
  const match = text.match(regex);
  return match ? match[1]?.trim() || '' : null;
};

export const parseListDeclarationNoColon = (nodeType: string, text: string): boolean => {
  const regex = new RegExp(`^${nodeType}\\s*$`);
  return regex.test(text);
};

export const matchSimpleListName = (text: string): string | null => {
  const match = text.match(/^(\$?[\w.-]+)$/);
  return match ? match[1] : null;
};

export const parseNodeWithColon = (text: string): { type: string; data: string } | null => {
  const match = text.match(/^([\w.-]+):\s?(.*)$/);
  if (!match) {
    return null;
  }
  return {
    type: match[1],
    data: (match[2] || '').trimEnd(),
  };
};

export const parseNodeWithoutColon = (text: string): { type: string; data: string } | null => {
  const match = text.match(/^([\w.-]+)(?:\s+(.*))?$/);
  if (!match) {
    return null;
  }
  return {
    type: match[1],
    data: (match[2] || '').trimEnd(),
  };
};

export const matchDeclarationWithColon = (text: string): { type: string; data: string } | null => {
  const match = text.match(/^([\w-]+):\s?(.*)$/);
  if (!match) {
    return null;
  }
  return {
    type: match[1],
    data: (match[2] || '').trimEnd(),
  };
};

export const matchDeclarationWithoutColon = (text: string): { type: string; data: string } | null => {
  const match = text.match(/^([\w-]+)\s*$/);
  if (!match) {
    return null;
  }
  return {
    type: match[1],
    data: '',
  };
};

export const isNumericValue = (text: string): boolean => {
  return /^-?\d+(\.\d+)?$/.test(text.trim());
};

export const matchIsCondition = (text: string): { left: string; right: string } | null => {
  const match = text.match(/^(.+?)\s+is\s+(.+)$/);
  if (!match) {
    return null;
  }
  return {
    left: match[1].trim(),
    right: match[2].trim(),
  };
};

export const splitOnWhitespace = (text: string): string[] => {
  return text.trim().split(/\s+/);
};

export const convertKebabToCamel = (text: string): string => {
  return text.replace(/-([a-z])/g, (_match: string, char: string) => char.toUpperCase());
};

export const matchWhereCondition = (text: string): { propertyName: string; matchValue: string } | null => {
  const match = text.match(/^([A-Za-z0-9_.-]+)\s+is\s+(.+)$/);
  if (!match) {
    return null;
  }
  return {
    propertyName: match[1],
    matchValue: match[2].trim(),
  };
};

export const extractLoopVariablesFromRangeData = (data: string): string[] => {
  const binding = matchRangeBinding(data);
  if (!binding) {
    return [];
  }
  return [binding.indexVar];
};

export const extractVariableBindingFromGetValueOrGetRecordData = (data: string): string | null => {
  const asIndex = data.lastIndexOf(' as ');
  if (asIndex === -1) {
    return null;
  }
  const afterAs = data.slice(asIndex + 4).trim();
  return afterAs.startsWith('$') ? afterAs.slice(1) : afterAs;
};
