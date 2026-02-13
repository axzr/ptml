import type { ListMap, StateMap } from '../state/state';
import type { FunctionMap } from '../types';
import type { Node } from '../types';

export type SemanticStackEntry = {
  type: string;
  loopVariables?: string[];
  siblingBindings?: string[];
  functionParameters?: string[];
  templateParameters?: string[];
};

export type ValidationResult = { isValid: true } | { isValid: false; errorMessage: string };

export type ValidationContext = {
  stateMap?: StateMap;
  listMap?: ListMap;
  functionMap?: FunctionMap;
  loopVariables?: Set<string>;
  lines?: string[];
  stack: SemanticStackEntry[];
  parentType?: string;
  isRoot?: boolean;
  availableTemplates?: Set<string>;
  availableDefines?: Set<string>;
};

export type ChildValidator = (child: Node, context: ValidationContext) => void;
