/**
 * The interaction states a "when" block can name, and how each maps to CSS.
 *
 * Deliberately dependency-free: both the data-type schema and the style builder
 * need these, and the schema registry is reachable from the style builder, so
 * anything imported here would close a cycle.
 *
 * focus maps to :focus-visible rather than :focus, so a ring appears for
 * keyboard users without sticking to a button after it is clicked with a mouse.
 */
export const INTERACTION_SELECTORS: Record<string, string> = {
  hover: ':hover',
  focus: ':focus-visible',
  active: ':active',
  disabled: ':disabled',
  placeholder: '::placeholder',
};

export const INTERACTION_STATES = Object.keys(INTERACTION_SELECTORS);

export const WHEN_NODE = 'when';

const CLASS_UNSAFE = /[^a-zA-Z0-9_-]/g;

// Derived from the style's name alone, so the class a document generates is the
// same on a server as in the browser and prerendered markup hydrates cleanly.
export const interactionClassName = (styleName: string): string =>
  `ptml-${styleName.trim().replace(CLASS_UNSAFE, '-')}`;
