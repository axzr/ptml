import type { Node } from '../types';

export type NodeParser = (
  lines: string[],
  startIndex: number,
  lineNumbers: number[],
) => { node: Node; nextIndex: number };

const parserMap = new Map<string, NodeParser>();

export const registerNodeParser = (nodeType: string, parser: NodeParser): void => {
  parserMap.set(nodeType, parser);
};

export const hasNodeParser = (nodeType: string): boolean => {
  return parserMap.has(nodeType);
};

export const getNodeParser = (nodeType: string): NodeParser => {
  const parser = parserMap.get(nodeType);
  if (!parser) {
    throw new Error(`No parser registered for node type "${nodeType}"`);
  }
  return parser;
};
