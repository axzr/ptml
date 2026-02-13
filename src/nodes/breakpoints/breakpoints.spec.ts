import { describe, it, expect } from 'vitest';
import { validate } from '../../validation/validate';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ValidatorErrors } from '../../errors/messages';
import {
  breakpointsValid,
  breakpointsLastHasWidth,
  breakpointsNotAscending,
  breakpointsInvalidWidth,
} from './breakpoints.example';

describe('breakpoints declaration', () => {
  it('accepts valid breakpoints with ascending widths and last without width', () => {
    const result = validate(breakpointsValid);
    expect(result.isValid).toBe(true);
  });

  it('rejects breakpoints when last child has a width', () => {
    const validation = validate(breakpointsLastHasWidth);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointsLastMustHaveNoWidth,
      'breakpoints',
      0,
      'large',
    );
  });

  it('rejects breakpoints when widths are not in ascending order', () => {
    const validation = validate(breakpointsNotAscending);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointsChildWidthAscending,
      'breakpoints',
      0,
      'medium',
      1024,
      768,
    );
  });

  it('rejects breakpoints when a non-last child has invalid width', () => {
    const validation = validate(breakpointsInvalidWidth);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.breakpointsChildWidthInvalid,
      'breakpoints',
      0,
      'small',
      'abc',
    );
  });
});
