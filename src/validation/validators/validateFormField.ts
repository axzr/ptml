import type { Node } from '../../types';
import type { ValidationContext } from '../types';
import { validateBlockDefault } from '../../categories/block/block.validation';
import { FormFieldErrors } from '../../errors/messages';

const childData = (node: Node, type: string): string => {
  const child = node.children.find((c) => c.type === type);
  return (child?.data ?? '').trim();
};

// A form field becomes live one of two ways: an id binds it to form.<id>, or a
// $-bound value binds it to a state variable. With neither, the renderer builds
// no onChange handler, so React renders a controlled field that silently
// refuses input -- which used to validate clean. Requiring id outright was the
// wrong shape: it rejected the perfectly good $value form while still missing
// the dead field. radio is exempt: it binds through name + value instead.
export const validateFormField = (node: Node, context: ValidationContext): void => {
  validateBlockDefault(node, context);
  if (node.category !== 'block') {
    return;
  }
  if (childData(node, 'id') || childData(node, 'value').startsWith('$')) {
    return;
  }
  throw new Error(FormFieldErrors.missingBinding(node.type, node.lineNumber));
};
