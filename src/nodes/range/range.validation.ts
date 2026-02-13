import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { extractVariableBindingFromGetValueOrGetRecordData } from '../../utils/regexPatterns';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';
import {
  inferLoopVariableExtractor,
  validateLoopVariableConflicts,
} from '../../validation/validators/validateLoopVariables';
import { ValidationErrors } from '../../errors/messages';

const collectSiblingBindingsFromRangeChildren = (node: Node): string[] => {
  const bindings: string[] = [];
  for (const child of node.children) {
    if (child.type === 'getValue' || child.type === 'getRecord') {
      if (child.data) {
        const bound = extractVariableBindingFromGetValueOrGetRecordData(child.data);
        if (bound && !bindings.includes(bound)) {
          bindings.push(bound);
        }
      }
    }
  }
  return bindings;
};

export const validateRange = (node: Node, context: ValidationContext): void => {
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

      const siblingBindings = collectSiblingBindingsFromRangeChildren(node);
      context.stack.push({ type: node.type, loopVariables, siblingBindings });
      validateNodeChildrenInternal(node, schema, context, blockChildValidator);
      context.stack.pop();
      return;
    }
  }

  validateNodeChildrenInternal(node, schema, context, blockChildValidator);
};
