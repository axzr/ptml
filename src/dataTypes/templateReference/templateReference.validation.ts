import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { parse } from '../../parsers/parser';
import { ValidatorErrors } from '../../errors/messages';
import { splitOnWhitespace } from '../../utils/regexPatterns';

const validateTemplateExistsFromLines = (templateName: string, node: Node, context: ValidationContext): void => {
  if (!context.lines) return;
  try {
    const nodes = parse(context.lines.join('\n'));
    const templateExists = nodes.some((n) => {
      if (n.type === 'template' && n.data) {
        const parts = splitOnWhitespace(n.data.trim());
        return parts.length > 0 && parts[0] === templateName;
      }
      return false;
    });

    if (!templateExists) {
      throw new Error(ValidatorErrors.templateNotFound(node.type, node.lineNumber, templateName));
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('references template')) {
      throw error;
    }
  }
};

export const validateTemplateReference = (value: string, node: Node, context?: ValidationContext): void => {
  if (!context || !context.lines) {
    return;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(ValidatorErrors.templateReferenceRequired(node.type, node.lineNumber));
  }

  const parts = splitOnWhitespace(trimmed);
  const templateName = parts[0];

  if (templateName.startsWith('$')) {
    return;
  }

  if (context.availableTemplates) {
    if (!context.availableTemplates.has(templateName)) {
      throw new Error(ValidatorErrors.templateNotFound(node.type, node.lineNumber, templateName));
    }
    return;
  }

  validateTemplateExistsFromLines(templateName, node, context);
};
