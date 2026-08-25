import type { NodeSchema } from '../../schemas/types';
import { validateWhen } from './when.validation';
import { INTERACTION_STATES } from '../../styles/interactionStates';

export const whenSchema: NodeSchema = {
  name: 'when',
  category: 'block',
  description:
    `Styles that apply only while an element is in a given interaction state: ${INTERACTION_STATES.join(', ')}. ` +
    'Valid only inside a define, because these become a real CSS rule attached to a generated class for that named ' +
    'style -- no pseudo-state can be expressed as an inline style, which is how every other PTML style is applied. ' +
    'focus means :focus-visible, so a focus ring appears for keyboard users without sticking to a button after a ' +
    'mouse click. Pair any hover style with a focus style: an affordance only a pointer can reach is invisible to ' +
    'anyone navigating by keyboard.',
  properties: {
    allowAny: true,
    description: 'CSS properties to apply while in this state.',
  },
  blocks: {
    list: [],
  },
  data: {
    required: true,
    format: {
      first: {
        name: 'interaction-state',
        description: `One of: ${INTERACTION_STATES.join(', ')}`,
        required: true,
        format: {
          type: 'string',
          validator: 'interaction-state',
        },
      },
    },
    min: 1,
    max: 1,
  },
  example: '> when: hover\n  - background-color: #f4f4f5',
  functions: {
    validate: validateWhen,
    getContext: () => ({ parentNode: 'define' }),
  },
};
