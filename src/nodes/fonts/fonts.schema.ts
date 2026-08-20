import type { NodeSchema } from '../../schemas/types';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validateDeclarationDefault } from '../../categories/declaration/declaration.validation';
import { ChildrenErrors, FontsErrors } from '../../errors/messages';
import { fontsNodeToReact } from './fonts.render';

const validateNoDuplicateFamilies = (node: Node): void => {
  const seen = new Map<string, number>();
  node.children
    .filter((child) => child.type === 'font')
    .forEach((child) => {
      const family = (child.data ?? '').trim().toLowerCase();
      if (!family) {
        return;
      }
      const firstLine = seen.get(family);
      if (firstLine !== undefined) {
        throw new Error(FontsErrors.duplicateFamily(child.lineNumber, (child.data ?? '').trim(), firstLine));
      }
      seen.set(family, child.lineNumber);
    });
};

const validateFonts = (node: Node, context: ValidationContext): void => {
  validateDeclarationDefault(node, context);
  if (node.category !== 'declaration') {
    return;
  }
  if (node.children.length === 0) {
    throw new Error(ChildrenErrors.minimumChildrenRequired(node.type, node.lineNumber, ['font']));
  }
  validateNoDuplicateFamilies(node);
};

export const fontsSchema: NodeSchema = {
  name: 'fonts',
  category: 'declaration',
  isRenderable: true,
  description:
    'Root node that loads web fonts from Google Fonts, so a prototype can use the real typeface rather than a lookalike whose metrics shift the line breaks. Each child is a font entry naming a family, optionally with the weights to load. Loaded fonts are then used through font-family in styles. Fonts are requested with font-display: block, so text waits briefly rather than painting once with fallback metrics and reflowing. If a font does not load for any reason -- a misspelled family, no network, a blocked request -- it is reported at runtime rather than silently falling back.',
  properties: {
    list: [{ name: 'font' }],
  },
  blocks: {
    list: [],
  },
  data: {
    allowed: false,
  },
  example: 'fonts:\n- font: Inter\n  - weights: 400 700',
  functions: {
    validate: validateFonts,
    getContext: () => ({ parentNode: undefined }),
    render: fontsNodeToReact,
  },
};
