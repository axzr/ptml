import type { Node } from '../../types';
import { IdErrors } from '../../errors/messages';

type Declaration = { id: string; node: Node; path: Node[] };
type Reference = { target: string; node: Node };

const isDynamic = (value: string): boolean => value.startsWith('$');

const childValue = (node: Node, type: string): string | null => {
  const child = node.children.find((c) => c.type === type);
  if (!child) {
    return null;
  }
  return (child.data ?? '').trim();
};

const collect = (nodes: Node[], path: Node[], declarations: Declaration[], references: Reference[]): void => {
  nodes.forEach((node) => {
    // Any block that carries an id child declares one -- input, textarea,
    // checkbox, radio, select -- rather than a hardcoded list of node types.
    if (node.category === 'block') {
      const id = childValue(node, 'id');
      if (id) {
        declarations.push({ id, node, path });
      }
      if (node.type === 'label') {
        const target = childValue(node, 'for');
        if (target) {
          references.push({ target, node });
        }
      }
    }
    collect(node.children, [...path, node], declarations, references);
  });
};

const isConditional = (node: Node): boolean => node.category === 'conditional';

// Two fields in different branches of the same conditional never render
// together, so sharing an id between them is legitimate -- a "contact" field
// that is an email input in one branch and a telephone input in the other.
const areMutuallyExclusive = (a: Node[], b: Node[]): boolean => {
  const shared = Math.min(a.length, b.length);
  for (let i = 0; i < shared; i++) {
    if (a[i] !== b[i]) {
      return isConditional(a[i]) && isConditional(b[i]);
    }
  }
  return false;
};

const validateNoDuplicates = (declarations: Declaration[]): void => {
  for (let i = 0; i < declarations.length; i++) {
    const current = declarations[i];
    if (isDynamic(current.id)) {
      continue;
    }
    for (let j = 0; j < i; j++) {
      const earlier = declarations[j];
      if (earlier.id !== current.id || isDynamic(earlier.id)) {
        continue;
      }
      if (areMutuallyExclusive(earlier.path, current.path)) {
        continue;
      }
      throw new Error(IdErrors.duplicateId(current.node.lineNumber, current.id, earlier.node.lineNumber));
    }
  }
};

const validateNoFixedIdInLoop = (declarations: Declaration[]): void => {
  declarations.forEach(({ id, node, path }) => {
    if (isDynamic(id)) {
      return;
    }
    if (path.some((ancestor) => ancestor.type === 'each' || ancestor.type === 'range')) {
      throw new Error(IdErrors.idInsideLoop(node.lineNumber, id));
    }
  });
};

const describeKnownIds = (ids: string[]): string =>
  ids.length === 0
    ? 'No field in this document declares an id.'
    : `Declared ids: ${Array.from(new Set(ids)).sort().join(', ')}`;

const validateForTargets = (declarations: Declaration[], references: Reference[]): void => {
  // A dynamic id or for is only known at render time, so there is nothing
  // reliable to check against; staying quiet beats a false accusation.
  if (declarations.some((declaration) => isDynamic(declaration.id))) {
    return;
  }
  const known = declarations.map((declaration) => declaration.id);
  references.forEach(({ target, node }) => {
    if (isDynamic(target) || known.includes(target)) {
      return;
    }
    throw new Error(IdErrors.forTargetNotFound(node.lineNumber, target, describeKnownIds(known)));
  });
};

export type FieldIds = { ids: Set<string>; allKnown: boolean };

// The keys of the implicit "form" state object that $form.<key> reads from.
// For most fields that is the id, but a radio writes under its group name --
// several radios share one name and one value between them.
const collectFormKeys = (nodes: Node[], keys: Set<string>, dynamic: { found: boolean }): void => {
  nodes.forEach((node) => {
    if (node.category === 'block') {
      const key = node.type === 'radio' ? childValue(node, 'name') : childValue(node, 'id');
      if (key) {
        if (isDynamic(key)) {
          dynamic.found = true;
        } else {
          keys.add(key);
        }
      }
    }
    collectFormKeys(node.children, keys, dynamic);
  });
};

// allKnown is false when a key is only decided at render time, or an import
// could declare more, in which case field names cannot be checked at all.
export const collectFieldIds = (nodes: Node[], hasImports: boolean): FieldIds => {
  const ids = new Set<string>();
  const dynamic = { found: false };
  collectFormKeys(nodes, ids, dynamic);
  return { ids, allKnown: !hasImports && !dynamic.found };
};

export const validateIds = (nodes: Node[], hasImports: boolean): void => {
  const declarations: Declaration[] = [];
  const references: Reference[] = [];
  collect(nodes, [], declarations, references);

  validateNoDuplicates(declarations);
  validateNoFixedIdInLoop(declarations);

  // An imported file can declare ids this document cannot see.
  if (!hasImports) {
    validateForTargets(declarations, references);
  }
};
