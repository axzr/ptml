import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { render as ptmlRender } from '../../renderers/render';
import { validate } from '../../validation/validate';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ValidatorErrors } from '../../errors/messages';
import {
  breakpointRendersWithViewport,
  breakpointRendersNothingWhenViewportOmitted,
  breakpointExample,
  breakpointOrLessRendersBelowUpperBound,
  breakpointUnknownLabel,
  breakpointHyphenatedWorkaround,
  breakpointUnknownLabelInDefine,
  breakpointWithoutBreakpointsDeclaration,
  breakpointMalformedModifier,
} from './breakpoint.example';
import { breakpointsExample } from '../breakpoints/breakpoints.example';

const textAt = (ptml: string, viewportWidth?: number): string => {
  const node = ptmlRender(ptml, undefined, viewportWidth);
  return render(<div>{node}</div>).container.textContent ?? '';
};

describe('breakpoint block', () => {
  // These fixtures went through render() only for a long time, and drifted to
  // an indentation the validator rejects without anything noticing.
  it.each([
    ['breakpointRendersWithViewport', breakpointRendersWithViewport],
    ['breakpointRendersNothingWhenViewportOmitted', breakpointRendersNothingWhenViewportOmitted],
  ])('%s is valid PTML, not just renderable', (_name, ptml) => {
    const result = validate(ptml);
    expect(result.isValid ? true : result.errorMessage).toBe(true);
  });

  it('renders children when viewportWidth matches breakpoint condition', () => {
    const node = ptmlRender(breakpointRendersWithViewport, undefined, 500);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('narrow');
    expect(container.textContent).not.toContain('wide');
  });

  it('renders large breakpoint content when viewportWidth >= 1024', () => {
    const node = ptmlRender(breakpointRendersWithViewport, undefined, 1200);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).toContain('wide');
    expect(container.textContent).not.toContain('narrow');
  });

  it('renders nothing from breakpoint blocks when viewportWidth is omitted', () => {
    const node = ptmlRender(breakpointRendersNothingWhenViewportOmitted);
    expect(node).not.toBeNull();
    const { container } = render(<div>{node}</div>);
    expect(container.textContent).not.toContain('narrow');
    expect(container.textContent).not.toContain('wide');
  });
});

describe('breakpoint "or more" / "or less" modifiers', () => {
  it('accepts the modifiers in block context', () => {
    expect(validate(breakpointExample).isValid).toBe(true);
  });

  it('accepts the modifiers in define context', () => {
    expect(validate(breakpointsExample).isValid).toBe(true);
  });

  it('matches "or less" for every width below the label upper bound', () => {
    // medium spans [768, 1024), so "medium or less" is everything under 1024.
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 375)).toContain('narrowish');
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 900)).toContain('narrowish');
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 1440)).not.toContain('narrowish');
  });

  it('matches "or more" from the label lower bound upwards', () => {
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 375)).not.toContain('widish');
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 900)).toContain('widish');
    expect(textAt(breakpointOrLessRendersBelowUpperBound, 1440)).toContain('widish');
  });

  it('rejects a modifier with no direction', () => {
    const validation = validate(breakpointMalformedModifier);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointReferenceInvalid,
      'breakpoint',
      0,
      'small or',
    );
  });
});

describe('breakpoint label validation', () => {
  it('rejects a label that no breakpoints declaration defines', () => {
    const validation = validate(breakpointUnknownLabel);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointNotFound,
      'breakpoint',
      0,
      'totalNonsenseLabel',
    );
  });

  it('rejects the hyphenated "small-or-less" workaround as an unknown label', () => {
    const validation = validate(breakpointHyphenatedWorkaround);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointNotFound,
      'breakpoint',
      0,
      'small-or-less',
    );
  });

  it('rejects an unknown label used with a modifier inside define', () => {
    const validation = validate(breakpointUnknownLabelInDefine);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.breakpointNotFound, 'breakpoint', 0, 'nonsense');
  });

  it('rejects any label when the file declares no breakpoints at all', () => {
    const validation = validate(breakpointWithoutBreakpointsDeclaration);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.breakpointNotFound, 'breakpoint', 0, 'small');
  });
});
