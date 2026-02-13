import { executeFunctionCall } from '../evaluation/functionOperations';
import type { Node, FunctionMap, ExecutionContext } from '../types';
import type { StateMap, ListMap } from '../state/state';

type InitExecutionResult = { state: StateMap; lists: ListMap; error: string | null };

const buildExecutionContext = (result: InitExecutionResult, functionMap: FunctionMap): ExecutionContext => ({
  state: result.state,
  setState: (updater) => {
    result.state = updater(result.state);
  },
  lists: result.lists,
  setLists: (updater) => {
    result.lists = updater(result.lists);
  },
  functionMap,
});

const runInitNodeCalls = (initNodes: Node[], context: ExecutionContext, result: InitExecutionResult): void => {
  initNodes.forEach((initNode) => {
    initNode.children.forEach((child) => {
      if (child.type === 'call') {
        try {
          context.state = result.state;
          context.lists = result.lists;
          executeFunctionCall(child, context);
          result.error = null;
        } catch (err) {
          result.error = err instanceof Error ? err.message : String(err);
        }
      }
    });
  });
};

export const executeInitNodes = (
  initNodes: Node[],
  state: StateMap,
  lists: ListMap,
  functionMap: FunctionMap,
): InitExecutionResult => {
  const result: InitExecutionResult = {
    state: { ...state },
    lists: { ...lists },
    error: null,
  };
  const context = buildExecutionContext(result, functionMap);
  runInitNodeCalls(initNodes, context, result);
  return result;
};
