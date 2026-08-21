import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { showSchema } from './show.schema';
import { validateNodeData } from '../../validation/validators/validateNodeData';
import { validateNodeChildrenInternal } from '../../validation/validators/validateChildren';
import { validateMinimumChildren } from '../../validation/validators/validateChildren';
import { blockChildValidator } from '../../categories/block/block.validation';
import { parseNamedTemplateArguments, parseTemplateArguments } from '../../templates/templateOperations';
import { TemplateArgumentErrors } from '../../errors/messages';
import { splitOnWhitespace } from '../../utils/regexPatterns';

const describeParameters = (parameters: string[]): string =>
  parameters.length === 0 ? 'That template takes no parameters.' : `Its parameters are: ${parameters.join(', ')}`;

const validatePositionalArguments = (
  node: Node,
  templateName: string,
  parameters: string[],
  positional: string[],
): void => {
  // Too few is allowed: an unsupplied parameter is empty, so templates can
  // treat parameters as optional. Too many is not, because the extras are
  // silently discarded -- which is what a value containing spaces looks like.
  if (positional.length > parameters.length) {
    throw new Error(
      TemplateArgumentErrors.tooManyArguments(node.lineNumber, templateName, parameters.length, positional.length),
    );
  }
};

const validateNamedArguments = (
  node: Node,
  templateName: string,
  parameters: string[],
  named: Record<string, string>,
): void => {
  Object.keys(named).forEach((argument) => {
    if (!parameters.includes(argument)) {
      throw new Error(
        TemplateArgumentErrors.unknownArgument(node.lineNumber, argument, templateName, describeParameters(parameters)),
      );
    }
  });
};

const validateTemplateArguments = (node: Node, context: ValidationContext): void => {
  const data = (node.data ?? '').trim();
  if (!data) {
    return;
  }
  const parts = splitOnWhitespace(data);
  const templateName = parts[0];
  // A template chosen at render time has no known parameter list.
  if (templateName.startsWith('$')) {
    return;
  }
  const parameters = context.templateParameters?.[templateName];
  if (!parameters) {
    return;
  }

  const positional = parseTemplateArguments(node);
  const named = parseNamedTemplateArguments(node);

  if (positional.length > 0 && Object.keys(named).length > 0) {
    throw new Error(TemplateArgumentErrors.mixedArgumentStyles(node.lineNumber));
  }

  validateNamedArguments(node, templateName, parameters, named);
  validatePositionalArguments(node, templateName, parameters, positional);
};

export const validateShow = (node: Node, context: ValidationContext): void => {
  validateMinimumChildren(node, showSchema);
  if (node.children.length > 0) {
    validateNodeChildrenInternal(node, showSchema, context, blockChildValidator);
  }
  validateNodeData(showSchema, node, context);
  validateTemplateArguments(node, context);
};
