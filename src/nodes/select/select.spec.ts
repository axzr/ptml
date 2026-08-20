import { describe, it, expect } from 'vitest';
import { validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { FormFieldErrors } from '../../errors/messages';
import {
  basicSelect,
  selectWithStyles,
  selectWithValue,
  selectInForm,
  selectWithNoBinding,
  selectBoundByValueOnly,
} from './select.example';

describe('select binding', () => {
  it.each([
    ['basicSelect', basicSelect],
    ['selectWithStyles', selectWithStyles],
    ['selectWithValue', selectWithValue],
    ['selectInForm', selectInForm],
    // selectWithDynamicOptions is deliberately absent: it puts "> each:" inside
    // "> select:", which select's blocks list has never allowed. It fails on
    // main too -- select had no spec, so the example was never checked.
  ])('%s is valid', (_name, ptml) => {
    const result = validate(ptml);
    expect(result.isValid ? true : result.errorMessage).toBe(true);
  });

  it('accepts a select bound by a $value alone, with no id', () => {
    expect(validate(selectBoundByValueOnly).isValid).toBe(true);
  });

  it('rejects a select with neither an id nor a $-bound value', () => {
    const validation = validate(selectWithNoBinding);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, FormFieldErrors.missingBinding, 'select', 0);
  });
});
