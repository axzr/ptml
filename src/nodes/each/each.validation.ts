import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';
import {
  inferLoopVariableExtractor,
  validateLoopVariableConflicts,
} from '../../validation/validators/validateLoopVariables';
import { ValidationErrors } from '../../errors/messages';

export const validateEach = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'block') {
    return;
  }
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);

  if (!schema) {
    throw new Error(ValidationErrors.unknownNodeType('block', node.type, node.lineNumber));
  }

  if (schema.category !== 'block') {
    throw new Error(ValidationErrors.notBlockNode(node.type, node.lineNumber));
  }

  validateNodeData(schema, node, context);
  validateMinimumChildren(node, schema);

  if (schema.managesLoopVariables && node.data) {
    const extractor = inferLoopVariableExtractor(schema);
    if (extractor) {
      const loopVariables = extractor(node.data);

      if (schema.checkVariableConflicts) {
        validateLoopVariableConflicts(loopVariables, node.type, node.lineNumber, context.stateMap);
      }

      context.stack.push({ type: node.type, loopVariables });
      validateNodeChildrenInternal(node, schema, context, blockChildValidator);
      context.stack.pop();
      return;
    }
  }

  validateNodeChildrenInternal(node, schema, context, blockChildValidator);
};
