export const CHILD_LINE_PREFIXES = ['> ', '- ', '? ', '! '] as const;

export const hasPrefix = (trimmedLine: string): boolean =>
  CHILD_LINE_PREFIXES.some((prefix) => trimmedLine.startsWith(prefix));
