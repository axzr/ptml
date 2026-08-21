import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validatePipeFunctions } from '../../validation/validators/helpers';
import { validatePipeExpression } from '../../validation/validators/validatePipe';
import { FormStateErrors } from '../../errors/messages';

// "form.email" with no $ is read as the literal text "form.email" rather than
// the field's contents, and nothing else in the language would notice. It is
// the mistake every form example in this repo used to make, so it is worth
// naming precisely rather than letting a prototype quietly show the wrong text.
const BARE_FORM_REFERENCE = /^form\.[A-Za-z0-9_-]+$/;

export const validatePipeExpressionValue = (value: string, node: Node, context?: ValidationContext): void => {
  if (!value || !value.trim()) {
    return;
  }

  if (BARE_FORM_REFERENCE.test(value.trim())) {
    throw new Error(FormStateErrors.missingDollar(node.type, node.lineNumber, value.trim()));
  }

  validatePipeFunctions(value, node.lineNumber, node.type);

  if (!context) {
    return;
  }

  validatePipeExpression(value, node, context);
};
