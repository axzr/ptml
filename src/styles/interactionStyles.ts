import type { Node } from '../types';
import type { NamedStylesMap } from '../renderers/types';
import type { StateMap, LoopVariablesMap } from '../state/state';
import { resolveVariable } from '../state/state';
import { INTERACTION_SELECTORS, WHEN_NODE, interactionClassName } from './interactionStates';

export { INTERACTION_SELECTORS, INTERACTION_STATES, WHEN_NODE, interactionClassName } from './interactionStates';

export const hasInteractionStates = (styleNode: Node): boolean =>
  styleNode.children.some((child) => child.type === WHEN_NODE);

const CSS_UNSAFE = /[{};<>]/g;

const resolvePropertyValue = (
  propertyNode: Node,
  state?: StateMap,
  loopVariables?: LoopVariablesMap,
): string | null => {
  const raw = (propertyNode.data ?? '').trim();
  if (!raw) {
    return null;
  }
  if (raw.startsWith('$')) {
    const resolved = resolveVariable(raw.slice(1).trim(), state ?? {}, loopVariables);
    return resolved === undefined ? null : String(resolved).replace(CSS_UNSAFE, '');
  }
  return raw.replace(CSS_UNSAFE, '');
};

const buildDeclarations = (whenNode: Node, state?: StateMap, loopVariables?: LoopVariablesMap): string => {
  const declarations: string[] = [];
  whenNode.children.forEach((propertyNode) => {
    if (propertyNode.category !== 'property') {
      return;
    }
    const value = resolvePropertyValue(propertyNode, state, loopVariables);
    if (value === null) {
      return;
    }
    // Inline styles always beat a class, and the base style of the very element
    // being hovered is inline, so an interaction style has to be able to win.
    // Authors cannot write raw CSS, so nothing can be fighting it.
    declarations.push(`${propertyNode.type.trim()}:${value} !important`);
  });
  return declarations.join(';');
};

export const buildInteractionStylesheet = (
  namedStyles: NamedStylesMap,
  state?: StateMap,
  loopVariables?: LoopVariablesMap,
): string => {
  const rules: string[] = [];

  Object.entries(namedStyles).forEach(([styleName, styleNode]) => {
    styleNode.children.forEach((child) => {
      if (child.type !== WHEN_NODE) {
        return;
      }
      const selector = INTERACTION_SELECTORS[(child.data ?? '').trim()];
      if (!selector) {
        return;
      }
      const declarations = buildDeclarations(child, state, loopVariables);
      if (declarations) {
        rules.push(`.${interactionClassName(styleName)}${selector}{${declarations}}`);
      }
    });
  });

  return rules.join('');
};

// The classes for the named styles a node uses, for whichever of them carry
// interaction states.
export const interactionClassesForNode = (node: Node, namedStyles: NamedStylesMap): string | undefined => {
  const classes = node.children
    .filter((child) => child.type === 'styles' && child.data && namedStyles[child.data])
    .filter((child) => hasInteractionStates(namedStyles[child.data]))
    .map((child) => interactionClassName(child.data));

  return classes.length > 0 ? Array.from(new Set(classes)).join(' ') : undefined;
};
