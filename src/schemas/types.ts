import type { Node, NodeCategory, ExecutionContext } from '../types';
import type { ValidationContext } from '../validation/types';
import type { StateOperationHandler, ListOperationHandler } from '../types';
import type { NodeRenderer } from '../renderers/types';

export type ChildNodeSchema = {
  name: string;
  required?: boolean;
  max?: number;
};

export type BlockDefinition = ChildNodeSchema;
export type PropertyDefinition = ChildNodeSchema;

export type BlocksSchema = {
  list?: BlockDefinition[];
  isContainerParent?: boolean;
  noRepeats?: boolean;
};

export type PropertiesSchema = {
  allowAny?: boolean;
  description?: string;
  list?: PropertyDefinition[];
  noRepeats?: boolean;
};

export type ConditionalsSchema = {
  allowed: boolean;
};

export type ActionsSchema = {
  allowAny?: boolean;
  allowedTypes?: string[];
};

type DataSchemaItem = {
  name: string;
  description: string;
  required: boolean;
  format: {
    type: 'string' | 'expression';
    validator?: string;
  };
};

type DataConstraint = {
  description: string;
  validate: (node: Node) => boolean;
};

export type DataSchema = {
  required?: boolean;
  allowed?: boolean;
  noRepeats?: boolean;
  format?: {
    first?: DataSchemaItem;
    second?: DataSchemaItem;
    rest?: DataSchemaItem;
    parts?: DataSchemaItem[];
    separator?: 'space' | 'comma';
  };
  min?: number;
  max?: number;
  constraints?: DataConstraint[];
};

export type ChildrenSchema = {
  noRepeats?: boolean;
  list: ChildNodeSchema[];
};

export type NodeFunctions = {
  validate: (node: Node, context: ValidationContext) => void;

  loopVariableExtractor?: (data: string) => string[];

  getContext: () => { parentNode?: string; lists?: string[]; state?: Record<string, string> };

  wrapAsParent?: (nodePTML: string) => string[] | string;
  wrapAsRoot?: (nodePTML: string) => string[];

  stateOperationHandler?: StateOperationHandler;
  listOperationHandler?: ListOperationHandler;

  execute?: (child: Node, context: ExecutionContext) => void;

  render?: NodeRenderer;
};

export type NodeSchema = {
  name: string;
  description: string;
  category: NodeCategory;
  blocks?: BlocksSchema;
  properties?: PropertiesSchema;
  conditionals?: ConditionalsSchema;
  actions?: ActionsSchema;
  data: DataSchema;
  example: string;
  isRenderable?: boolean;
  managesLoopVariables?: boolean;
  checkVariableConflicts?: boolean;
  requiresSibling?: string;
  skipsRenderingInLoops?: boolean;
  updatesLoopVariables?: boolean;
  initializesState?: boolean;
  initializesLists?: boolean;
  listItemType?: 'value' | 'record';
  childType?: boolean;
  requiresFunctionalContext?: boolean;
  providesFunctionalContext?: boolean;
  allowedAsContainerChild?: boolean;

  functions: NodeFunctions;
};
