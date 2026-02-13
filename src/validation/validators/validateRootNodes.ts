import type { Node } from '../../types';
import type { ValidationContext } from '../types';
import { validateNodeAgainstSchema } from './validateNode';
import { RootNodeErrors, ValidationErrors } from '../../errors/messages';
import { getSchemaMap } from '../../schemaRegistry/schemaMap';

export const assertValidRootDeclaration = (type: string, _data: string, lineNumber: number): void => {
  const schemaMap = getSchemaMap();
  const schema = schemaMap.get(type);

  if (schema && schema.category === 'declaration') {
    return;
  }

  if (schema) {
    throw new Error(RootNodeErrors.rootMustBeDeclaration(schema.category, type, lineNumber));
  }

  throw new Error(ValidationErrors.unknownNodeType('declaration', type, lineNumber));
};

export const validateRootNodes = (rootNodes: Node[], context: ValidationContext): void => {
  if (rootNodes.length === 0) {
    throw new Error(RootNodeErrors.emptyFile());
  }

  for (const node of rootNodes) {
    if (node.category !== 'declaration') {
      throw new Error(RootNodeErrors.rootMustBeDeclaration(node.category, node.type, node.lineNumber));
    }
  }

  const declarationNodes = rootNodes.filter((node) => node.category === 'declaration');

  const ptmlNodes = declarationNodes.filter((node) => node.type === 'ptml');
  if (ptmlNodes.length > 1) {
    throw new Error(RootNodeErrors.multiplePTML(ptmlNodes.length, ptmlNodes.map((n) => n.lineNumber).join(', ')));
  }

  for (const node of declarationNodes) {
    validateNodeAgainstSchema(node, context);
  }
};
