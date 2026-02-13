import { parseEachNodeData } from '../../parsers/eachParser';
import { resolveListFromState } from './eachListResolution';
import { executeChildNode } from '../../evaluation/functionOperations';
import type { Node } from '../../types';
import type { LoopVariablesMap } from '../../state/state';
import type { ExecutionContext } from '../../types';

export const executeEachNode = (eachNode: Node, context: ExecutionContext): void => {
  if (!eachNode.data || !context.lists) return;

  const parsed = parseEachNodeData(eachNode.data);
  if (!parsed) return;

  const list = resolveListFromState(parsed.listName, context.state, context.loopVariables, context.lists);

  if (!list || list.length === 0) return;

  const functionParams = context.loopVariables || {};
  const itemVar = parsed.itemVariableName ?? 'item';
  const indexVar = parsed.indexVariableName ?? 'index';

  list.forEach((item, index) => {
    const eachLoopVariables: LoopVariablesMap = {
      ...functionParams,
      [itemVar]: item,
      [indexVar]: index,
    };

    const eachContext: ExecutionContext = {
      ...context,
      loopVariables: eachLoopVariables,
    };

    eachNode.children.forEach((child) => {
      executeChildNode(child, eachContext);
    });
  });
};
