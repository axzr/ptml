import type { BlockDefinition, NodeSchema } from '../schemas/types';
import { getBlocksList } from './schemaMap';

export const formatAllowedChildrenForError = (schema: NodeSchema): string => {
  const blocksList: BlockDefinition[] = (getBlocksList as (s: NodeSchema) => BlockDefinition[])(schema);
  const hasBlocks = blocksList.length > 0;
  const hasProperties = schema.properties !== undefined;
  const hasConditionals = schema.conditionals?.allowed === true;
  const hasActions = schema.actions?.allowAny === true || (schema.actions?.allowedTypes?.length ?? 0) > 0;

  const allowedTypes: string[] = [];
  if (hasBlocks) {
    allowedTypes.push('blocks');
  }
  if (hasProperties) {
    allowedTypes.push('properties');
  }
  if (hasConditionals) {
    allowedTypes.push('conditionals');
  }
  if (hasActions) {
    allowedTypes.push('actions');
  }

  return allowedTypes.length > 0 ? allowedTypes.join(' or ') : 'none';
};
