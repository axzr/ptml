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
  availableBreakpoints?: Set<string>;
  // Ids declared by form fields; also the keys of the implicit form state
  // object. fieldIdsAreKnown is false when some id is only known at render
  // time, or an import could declare more.
  availableFieldIds?: Set<string>;
  fieldIdsAreKnown?: boolean;
  // Declared parameters per template name, for checking named show arguments.
  templateParameters?: Record<string, string[]>;
};

export type ChildValidator = (child: Node, context: ValidationContext) => void;
