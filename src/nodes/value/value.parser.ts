import type { Node } from '../../types';
import type { NodeParser } from '../../parsers/nodeParserRegistry';

export const parseValue: NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
): { node: Node; nextIndex: number } => {
  const line = lines[startIndex];
  const trimmedLine = line.trim();

  if (!trimmedLine.startsWith('- ')) {
    throw new Error(`Expected value node to start with "- " on line ${lineNumbers[startIndex]}`);
  }

  const content = trimmedLine.substring(2).trim();
  const node: Node = {
    category: 'property',
    type: 'value',
    data: content,
    children: [],
    lineNumber: lineNumbers[startIndex],
  };

  return { node, nextIndex: startIndex + 1 };
};
