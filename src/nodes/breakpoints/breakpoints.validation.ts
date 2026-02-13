import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { breakpointsSchema } from './breakpoints.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { ChildrenErrors, ValidatorErrors } from '../../errors/messages';
import { breakpointsChildValidator } from './breakpointsChildValidator';

const NON_NEGATIVE_INTEGER_REGEX = /^\d+$/;

const throwLastMustHaveNoWidth = (node: Node, child: Node, label: string): never => {
  throw new Error(
    ValidatorErrors.breakpointsLastMustHaveNoWidth(node.type, child.lineNumber ?? node.lineNumber, label),
  );
};

const throwChildWidthInvalid = (node: Node, child: Node, label: string, dataStr: string): never => {
  throw new Error(
    ValidatorErrors.breakpointsChildWidthInvalid(
      node.type,
      child.lineNumber ?? node.lineNumber,
      label,
      dataStr || '(empty)',
    ),
  );
};

const throwChildWidthAscending = (
  node: Node,
  child: Node,
  label: string,
  previousWidth: number,
  width: number,
): never => {
  throw new Error(
    ValidatorErrors.breakpointsChildWidthAscending(
      node.type,
      child.lineNumber ?? node.lineNumber,
      label,
      previousWidth,
      width,
    ),
  );
};

const validateBreakpointChildWidth = (
  node: Node,
  child: Node,
  label: string,
  dataStr: string,
  isLast: boolean,
  previousWidth: number | null,
): number | null => {
  if (isLast) {
    if (dataStr !== '') throwLastMustHaveNoWidth(node, child, label);
    return previousWidth;
  }
  if (!NON_NEGATIVE_INTEGER_REGEX.test(dataStr)) throwChildWidthInvalid(node, child, label, dataStr);
  const width = parseInt(dataStr, 10);
  if (previousWidth !== null && width <= previousWidth)
    throwChildWidthAscending(node, child, label, previousWidth, width);
  return width;
};

const validateBreakpointsOrderAndLast = (node: Node): void => {
  let previousWidth: number | null = null;
  const lastIndex = node.children.length - 1;
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    const isLast = i === lastIndex;
    const label = (child.type ?? '').trim();
    const dataStr = (child.data ?? '').trim();
    previousWidth = validateBreakpointChildWidth(node, child, label, dataStr, isLast, previousWidth);
  }
};

export const validateBreakpoints = (node: Node, context: ValidationContext): void => {
  if (node.category !== 'declaration') {
    return;
  }
  validateNodeData(breakpointsSchema, node, context);
  if (node.children.length === 0) {
    throw new Error(
      ChildrenErrors.minimumChildrenRequired(node.type, node.lineNumber, ['at least one breakpoint label']),
    );
  }
  context.stack.push({ type: node.type });
  try {
    validateNodeChildrenInternal(node, breakpointsSchema, context, breakpointsChildValidator);
  } finally {
    context.stack.pop();
  }
  validateBreakpointsOrderAndLast(node);
};
