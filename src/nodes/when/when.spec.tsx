import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { render as renderPtml, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { InteractionErrors, ValidatorErrors } from '../../errors/messages';
import { INTERACTION_STATES } from '../../styles/interactionStates';
import {
  whenHoverAndFocus,
  whenEveryState,
  whenValueFromState,
  whenUnknownState,
  whenInsideInlineStyles,
} from './when.example';

const renderMarkup = (ptml: string): HTMLElement => render(<div>{renderPtml(ptml)}</div>).container;

const stylesheetOf = (ptml: string): string => renderMarkup(ptml).querySelector('style')?.textContent ?? '';

describe('when: interaction styles', () => {
  it('emits a CSS rule rather than an inline style, which could not carry a pseudo-state', () => {
    const css = stylesheetOf(whenHoverAndFocus);
    expect(css).toContain('.ptml-card:hover{background-color:#f4f4f5 !important}');
  });

  it('maps focus to :focus-visible, so a ring does not stick after a mouse click', () => {
    expect(stylesheetOf(whenHoverAndFocus)).toContain('.ptml-card:focus-visible{');
  });

  it('puts the generated class on the element that uses the named style', () => {
    expect(renderMarkup(whenHoverAndFocus).querySelector('button')?.className).toBe('ptml-card');
  });

  it('keeps the base styles inline, so nothing about existing documents changes', () => {
    const style = renderMarkup(whenHoverAndFocus).querySelector('button')?.getAttribute('style') ?? '';
    expect(style).toContain('background-color: rgb(255, 255, 255)');
    expect(style).not.toContain('f4f4f5');
  });

  it('marks declarations important, because an inline base style would otherwise win', () => {
    // Authors cannot write raw CSS, so nothing can be competing with this.
    expect(stylesheetOf(whenHoverAndFocus)).toContain('!important');
  });

  it('supports every interaction state', () => {
    const css = stylesheetOf(whenEveryState);
    expect(css).toContain(':hover{');
    expect(css).toContain(':focus-visible{');
    expect(css).toContain(':active{');
    expect(css).toContain(':disabled{');
    expect(css).toContain('::placeholder{');
    expect(INTERACTION_STATES).toEqual(['hover', 'focus', 'active', 'disabled', 'placeholder']);
  });

  it('resolves a value taken from state', () => {
    expect(stylesheetOf(whenValueFromState)).toContain('color:#e11d48 !important');
  });

  it('emits no stylesheet at all for a document with no interaction styles', () => {
    const container = renderMarkup('define: plain\n- color: red\n\nptml:\n> box:\n  - styles: plain\n  > text: x\n');
    expect(container.querySelector('style')).toBeNull();
    expect(container.querySelector('[class]')).toBeNull();
  });

  it('cannot be used to break out of the stylesheet or inject markup', () => {
    const css = stylesheetOf(
      'define: c\n> when: hover\n  - color: red}</style><script>x</script>\n\nptml:\n> box:\n  - styles: c\n  > text: x\n',
    );
    expect(css).not.toContain('</style>');
    expect(css).not.toContain('<script>');
    expect(css).not.toContain('}<');
  });
});

describe('when: validation', () => {
  it('accepts a define carrying interaction styles', () => {
    const result = validate(whenHoverAndFocus);
    expect(result.isValid ? true : result.errorMessage).toBe(true);
  });

  it('rejects a state it does not know, listing the ones it does', () => {
    const validation = validate(whenUnknownState);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.interactionStateInvalid,
      0,
      'wobble',
      INTERACTION_STATES.join(', '),
    );
  });

  it('rejects a when block inside inline styles, which have no class to hang a rule on', () => {
    const validation = validate(whenInsideInlineStyles);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, InteractionErrors.whenOutsideDefine, 0);
  });
});
