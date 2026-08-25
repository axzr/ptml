import type { DataTypeSchema } from '../types';
import { validateInteractionState } from './interactionState.validation';
import { INTERACTION_STATES } from '../../styles/interactionStates';

export const interactionStateSchema: DataTypeSchema = {
  name: 'interaction-state',
  description: `The interaction state these styles apply in: ${INTERACTION_STATES.join(', ')}.`,
  example: 'hover',
  functions: {
    validate: validateInteractionState,
  },
};
