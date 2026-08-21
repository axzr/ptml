import type { Node } from '../../types';
import type { StateValue } from '../../state/state';
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
import { SortErrors, ValidationErrors } from '../../errors/messages';
import { parseEachNodeData } from '../../parsers/eachParser';
import { parseSortSpec } from './eachSort';

// A sort by a property no record carries would quietly leave the order
// untouched. Where the list is declared in this document we can say so; for a
// host-supplied list there is nothing to check against, so the check is skipped.
const validateSortAgainstList = (node: Node, sortNode: Node, path: string[], context: ValidationContext): void => {
  const parsed = node.data ? parseEachNodeData(node.data) : null;
  const list = parsed && context.listMap ? context.listMap[parsed.listName] : undefined;
  if (!list || list.length === 0) {
    return;
  }
  const records = list.filter(
    (item): item is { [key: string]: StateValue } => typeof item === 'object' && item !== null && !Array.isArray(item),
  );
  if (records.length !== list.length) {
    return;
  }
  const property = path[0];
  if (records.some((record) => property in record)) {
    return;
  }
  const available = Array.from(new Set(records.flatMap((record) => Object.keys(record)))).join(', ');
  throw new Error(SortErrors.propertyNotOnRecords(sortNode.lineNumber, path.join('.'), parsed!.listName, available));
};

const validateEachSort = (node: Node, context: ValidationContext): void => {
  const sortNode = node.children.find((child) => child.type === 'sort');
  if (!sortNode) {
    return;
  }
  const parsed = parseSortSpec(sortNode.data);
  if ('error' in parsed) {
    throw new Error(
      parsed.error === 'empty'
        ? SortErrors.missingSpec(sortNode.lineNumber)
        : SortErrors.invalidSpec(sortNode.lineNumber, parsed.found),
    );
  }
  if (parsed.spec.path) {
    validateSortAgainstList(node, sortNode, parsed.spec.path, context);
  }
};

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
  validateEachSort(node, context);

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
