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
    'Iterates over a list, rendering its children for each item. Can optionally bind the item and/or index to variables, and accepts the same children a box does. An optional sort child orders the items at render time without changing the list itself: "- sort: title" orders by that property ascending, "- sort: title desc" reverses it, and "- sort: asc" or "- sort: desc" orders a list of plain values by the values themselves. Numbers compare as numbers, so 10 sorts after 3, and text compares case-insensitively with embedded numbers read naturally, so "item 10" follows "item 9". Items missing the sorted property sort last ascending. Equal items keep their original order. To sort by a property actually named asc or desc, give the direction explicitly: "- sort: desc asc".',
  managesLoopVariables: true,
  checkVariableConflicts: true,
  blocks: {
    // Was a hand-maintained list of eight node types, which silently excluded
    // image, table, input, svg, list, header, form and breakpoint -- all of
    // which worked perfectly one level down inside a box. That list was a
    // strict subset of the container children, so deferring to them can only
    // widen what is accepted, and new renderable nodes are picked up for free.
    isContainerParent: true,
  },
  properties: {
    list: [{ name: 'styles' }, { name: 'sort' }],
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
