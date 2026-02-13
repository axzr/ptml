import { validateRange } from './range.validation';
import { executeRangeNode } from './range.execute';
import { extractLoopVariablesFromRangeData } from '../../utils/regexPatterns';
import type { NodeSchema } from '../../schemas/types';

export const rangeSchema: NodeSchema = {
  name: 'range',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description: 'A range node that iterates over a state variable. Range nodes must have at least one child.',
  managesLoopVariables: true,
  checkVariableConflicts: true,
  blocks: {
    list: [{ name: 'range' }],
  },
  properties: {
    list: [],
  },
  actions: {
    allowAny: true,
  },
  requiresFunctionalContext: true,
  data: {
    required: true,
    format: {
      separator: 'comma',
      first: {
        name: 'range specification',
        description: 'State variable and index binding. Format: $stateVariable as $index',
        required: true,
        format: {
          type: 'string',
          validator: 'range-binding',
        },
      },
    },
    min: 1,
  },
  example: '- range: $items as $index',

  functions: {
    validate: validateRange,
    loopVariableExtractor: extractLoopVariablesFromRangeData,
    getContext: () => ({ state: { items: '[1, 2, 3]' }, parentNode: 'function' }),
    execute: executeRangeNode,
  },
};
