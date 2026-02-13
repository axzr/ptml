import type {
  BlockNodeType,
  ActionNodeType,
  ConditionalNodeType,
  DeclarationNodeType,
  PropertyNodeType,
} from './utils/nodeTypes';
import type { StateMap, ListMap, LoopVariablesMap } from './state/state';

export {
  BLOCK_NODE_TYPES,
  ACTION_NODE_TYPES,
  PROPERTY_NODE_TYPES,
  CONDITIONAL_NODE_TYPES,
  DECLARATION_NODE_TYPES,
} from './utils/nodeTypes';

export type NodeCategory = 'block' | 'property' | 'conditional' | 'action' | 'declaration';

export interface BaseNode {
  category: NodeCategory;
  data: string;
  lineNumber: number;
}

export interface BlockNode extends BaseNode {
  category: 'block';
  type: BlockNodeType;
  children: (BlockNode | PropertyNode | ConditionalNode | ActionNode)[];
}

export interface ActionNode extends BaseNode {
  category: 'action';
  type: ActionNodeType;
  children: (ActionNode | PropertyNode)[];
}

export interface PropertyNode extends BaseNode {
  category: 'property';
  type: PropertyNodeType;
  children: (PropertyNode | ConditionalNode)[];
}

export interface ConditionalNode extends BaseNode {
  category: 'conditional';
  type: ConditionalNodeType;
  children: (BlockNode | PropertyNode | ConditionalNode | ActionNode)[];
}

export interface DeclarationNode extends BaseNode {
  category: 'declaration';
  type: DeclarationNodeType;
  children: Node[];
}

export type Node = BlockNode | PropertyNode | ConditionalNode | ActionNode | DeclarationNode;

export type ListOperationHandler = (
  node: Node,
  lists: ListMap,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
) => ListMap;

export type StateOperationHandler = (
  node: Node,
  state: StateMap,
  loopVariables?: LoopVariablesMap,
  lists?: ListMap,
) => StateMap;

export type FunctionMap = Record<string, Node>;

export type PtmlFilesMap = Record<string, string>;

export type ExecutionContext = {
  state: StateMap;
  setState?: (updater: (prevState: StateMap) => StateMap) => void;
  lists?: ListMap;
  setLists?: (updater: (prevLists: ListMap) => ListMap) => void;
  functionMap?: FunctionMap;
  loopVariables?: LoopVariablesMap;
  setError?: (error: string | null) => void;
};
