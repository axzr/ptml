import { getSchemaMap } from '../schemaRegistry/schemaMap';

const categorizeSchemas = (
  blocks: string[],
  actions: string[],
  properties: string[],
  conditionals: string[],
  declarations: string[],
): void => {
  const schemaMap = getSchemaMap();
  schemaMap.forEach((schema) => {
    switch (schema.category) {
      case 'block':
        blocks.push(schema.name);
        break;
      case 'action':
        actions.push(schema.name);
        break;
      case 'property':
        properties.push(schema.name);
        break;
      case 'conditional':
        conditionals.push(schema.name);
        break;
      case 'declaration':
        declarations.push(schema.name);
        break;
    }
  });
};

export const buildNodeTypesByCategory = (): {
  blocks: readonly string[];
  actions: readonly string[];
  properties: readonly string[];
  conditionals: readonly string[];
  declarations: readonly string[];
} => {
  const blocks: string[] = [];
  const actions: string[] = [];
  const properties: string[] = [];
  const conditionals: string[] = [];
  const declarations: string[] = [];

  categorizeSchemas(blocks, actions, properties, conditionals, declarations);

  return {
    blocks: blocks.sort() as readonly string[],
    actions: actions.sort() as readonly string[],
    properties: properties.sort() as readonly string[],
    conditionals: conditionals.sort() as readonly string[],
    declarations: declarations.sort() as readonly string[],
  };
};

const nodeTypes = buildNodeTypesByCategory();

export const BLOCK_NODE_TYPES = nodeTypes.blocks;
export const ACTION_NODE_TYPES = nodeTypes.actions;
export const PROPERTY_NODE_TYPES = nodeTypes.properties;
export const CONDITIONAL_NODE_TYPES = nodeTypes.conditionals;
export const DECLARATION_NODE_TYPES = nodeTypes.declarations;

export type BlockNodeType = (typeof BLOCK_NODE_TYPES)[number];
export type ActionNodeType = (typeof ACTION_NODE_TYPES)[number];
export type PropertyNodeType = (typeof PROPERTY_NODE_TYPES)[number];
export type ConditionalNodeType = (typeof CONDITIONAL_NODE_TYPES)[number];
export type DeclarationNodeType = (typeof DECLARATION_NODE_TYPES)[number];
