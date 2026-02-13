import { validateEach } from './each.validation';
import { eachNodeToReact } from './each.render';
import { executeEachNode } from './each.execute';
import { indentChildLines, addListContext } from '../../schemaRegistry/ptmlBuilder';
import { extractLoopVariablesFromEachData } from '../../utils/loopVariables';
import type { NodeSchema } from '../../schemas/types';

export const eachSchema: NodeSchema = {
  name: 'each',
  category: 'block',
  isRenderable: true,
  allowedAsContainerChild: true,
  description:
    'Iterates over a list, rendering its children for each item. Can optionally bind the item and/or index to variables.',
  managesLoopVariables: true,
  checkVariableConflicts: true,
  blocks: {
    list: [
      { name: 'box' },
      { name: 'text' },
      { name: 'button' },
      { name: 'each' },
      { name: 'if' },
      { name: 'else' },
      { name: 'show' },
      { name: 'link' },
    ],
  },
  properties: {
    list: [{ name: 'styles' }],
  },
  conditionals: {
    allowed: true,
  },
  actions: {
    allowAny: true,
  },
  data: {
    required: true,
    format: {
      separator: 'comma',
      first: {
        name: 'list specification',
        description:
          'List name followed by optional "as $variable" to bind the item. Format: <listName> [as $variable]',
        required: true,
        format: {
          type: 'string',
          validator: 'list-name-with-optional-binding',
        },
      },
      second: {
        name: 'index specification',
        description: 'Optional index binding. Format: index as $variable',
        required: false,
        format: {
          type: 'string',
          validator: 'index-binding',
        },
      },
    },
    min: 1,
  },
  example: '- each: items as $item',

  functions: {
    validate: validateEach,
    loopVariableExtractor: extractLoopVariablesFromEachData,
    getContext: () => ({ lists: ['fruits'], parentNode: 'box' }),
    execute: executeEachNode,
    render: eachNodeToReact,
    wrapAsParent: (nodePTML: string) => {
      const parts: string[] = [];
      addListContext(parts, ['items']);
      parts.push('ptml:');
      parts.push('> each: items as $item');
      parts.push(indentChildLines(nodePTML, 2));
      return parts.join('\n');
    },
  },
};
