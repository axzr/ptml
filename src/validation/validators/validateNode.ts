import type { Node } from '../../types';
import type { ChildValidator, ValidationContext } from '../types';
import type { NodeSchema } from '../../schemas/types';
import { validateNodeChildrenInternal } from './validateChildren';
import { validateMinimumChildren } from './validateChildren';
import { inferLoopVariableExtractor, validateLoopVariableConflicts } from './validateLoopVariables';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';
import { ValidationErrors, ActionErrors } from '../../errors/messages';

const hasFunctionalContextAncestor = (context: ValidationContext): boolean =>
  context.stack.some((entry) => getSchemaMap().get(entry.type)?.providesFunctionalContext === true);

export const validateChildNode: ChildValidator = (child: Node, context: ValidationContext): void => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(child.type);
  if (!schema?.functions.validate) {
    throw new Error(ValidationErrors.unknownCategory(child.category, child.type, child.lineNumber));
  }
  if (schema.requiresFunctionalContext && !hasFunctionalContextAncestor(context)) {
    throw new Error(ActionErrors.requiresFunctionalContext(child.type, child.lineNumber));
  }
  schema.functions.validate(child, context);
};

export const validateNodeChildren = (node: Node, schema: NodeSchema, context: ValidationContext): void => {
  validateMinimumChildren(node, schema);

  if (schema.managesLoopVariables && node.data) {
    const extractor = inferLoopVariableExtractor(schema);
    if (extractor) {
      const loopVariables = extractor(node.data);

      if (schema.checkVariableConflicts) {
        validateLoopVariableConflicts(loopVariables, node.type, node.lineNumber, context.stateMap);
      }

      context.stack.push({ type: node.type, loopVariables });
      validateNodeChildrenInternal(node, schema, context, validateChildNode);
      context.stack.pop();
      return;
    }
  }

  validateNodeChildrenInternal(node, schema, context, validateChildNode);
};

export const validateNodeAgainstSchema = (node: Node, context: ValidationContext): void => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(node.type);
  if (!schema || !schema.functions.validate) {
    throw new Error(ValidationErrors.unknownNodeType(node.category, node.type, node.lineNumber));
  }
  if (schema.requiresFunctionalContext && !hasFunctionalContextAncestor(context)) {
    throw new Error(ActionErrors.requiresFunctionalContext(node.type, node.lineNumber));
  }
  schema.functions.validate(node, context);
};
