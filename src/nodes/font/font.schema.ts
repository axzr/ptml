import type { NodeSchema } from '../../schemas/types';
import type { Node } from '../../types';
import type { ValidationContext } from '../../validation/types';
import { validatePropertyDefault } from '../../categories/property/property.validation';
import { FontsErrors } from '../../errors/messages';
import { parseFontVariants } from '../fonts/googleFonts';

// The family goes in the data rather than the key because PTML property keys
// match [\w.-]+ -- no spaces -- and plenty of families ("Playfair Display")
// have them.
const INVALID_FAMILY_CHARACTERS = /[:&?,]/;

const validateFont = (node: Node, context: ValidationContext): void => {
  validatePropertyDefault(node, context);
  if (node.category !== 'property') {
    return;
  }

  const family = (node.data ?? '').trim();
  if (!family) {
    throw new Error(FontsErrors.familyRequired(node.lineNumber));
  }
  if (INVALID_FAMILY_CHARACTERS.test(family)) {
    throw new Error(FontsErrors.familyInvalid(node.lineNumber, family));
  }

  const weightsNode = node.children.find((child) => child.type === 'weights');
  if (weightsNode) {
    const { invalid } = parseFontVariants(weightsNode.data);
    if (invalid.length > 0) {
      throw new Error(FontsErrors.invalidVariants(weightsNode.lineNumber, ...invalid));
    }
  }
};

export const fontSchema: NodeSchema = {
  name: 'font',
  category: 'property',
  description:
    'A single font family to load, named in the data (e.g. "- font: Playfair Display"). An optional weights child lists the weights to load and whether italics are needed. Only valid inside a fonts declaration.',
  properties: {
    list: [{ name: 'weights' }],
  },
  blocks: {
    list: [],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'family',
        description: 'The font family name exactly as Google Fonts spells it, e.g. Inter or Playfair Display.',
        required: true,
        format: { type: 'string' },
      },
    },
    min: 1,
  },
  example: '- font: Inter',
  functions: {
    validate: validateFont,
    getContext: () => ({ parentNode: 'fonts' }),
  },
};
