import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { render as renderPtml, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { FormFieldErrors, SelectErrors } from '../../errors/messages';
import {
  basicSelect,
  selectWithStyles,
  selectWithValue,
  selectInForm,
  selectWithDynamicOptions,
  selectSortedOptions,
  selectWithConditionalOption,
  selectWithNoOptions,
  selectOverPossiblyEmptyList,
  selectWithBoxChild,
  selectWithNoBinding,
  selectBoundByValueOnly,
} from './select.example';

const renderSelect = (ptml: string): HTMLSelectElement => {
  render(<div>{renderPtml(ptml)}</div>);
  return screen.getByRole('combobox') as HTMLSelectElement;
};

const optionsOf = (select: HTMLSelectElement): string[] =>
  Array.from(select.options).map((option) => `${option.value}:${option.textContent}`);

describe('select validation', () => {
  it.each([
    ['basicSelect', basicSelect],
    ['selectWithStyles', selectWithStyles],
    ['selectWithValue', selectWithValue],
    ['selectInForm', selectInForm],
    ['selectWithDynamicOptions', selectWithDynamicOptions],
    ['selectSortedOptions', selectSortedOptions],
    ['selectWithConditionalOption', selectWithConditionalOption],
    ['selectOverPossiblyEmptyList', selectOverPossiblyEmptyList],
    ['selectBoundByValueOnly', selectBoundByValueOnly],
  ])('%s is valid', (_name, ptml) => {
    const result = validate(ptml);
    expect(result.isValid ? true : result.errorMessage).toBe(true);
  });

  it('rejects a select that can never have options', () => {
    const validation = validate(selectWithNoOptions);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, SelectErrors.noOptions, 0);
  });

  it('accepts a select whose list may be empty at runtime', () => {
    // Emptiness here is a data condition, not a mistake in the document.
    expect(validate(selectOverPossiblyEmptyList).isValid).toBe(true);
  });

  it('rejects a box inside a select, which the DOM would not accept', () => {
    expect(validate(selectWithBoxChild).isValid).toBe(false);
  });

  it('rejects a select with neither an id nor a $-bound value', () => {
    const validation = validate(selectWithNoBinding);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, FormFieldErrors.missingBinding, 'select', 0);
  });
});

describe('select rendering', () => {
  it('renders a select element carrying its options', () => {
    expect(optionsOf(renderSelect(basicSelect))).not.toHaveLength(0);
  });

  it('generates options from a list with each', () => {
    expect(optionsOf(renderSelect(selectWithDynamicOptions))).toEqual(['us:United States', 'ca:Canada', 'mx:Mexico']);
  });

  it('puts generated options directly inside the select, with no wrapper element', () => {
    render(<div>{renderPtml(selectWithDynamicOptions)}</div>);
    const select = screen.getByRole('combobox');
    const tags = Array.from(select.children).map((child) => child.tagName);
    expect(new Set(tags)).toEqual(new Set(['OPTION']));
  });

  it('orders generated options when each sorts them', () => {
    expect(optionsOf(renderSelect(selectSortedOptions))).toEqual(['ca:Canada', 'us:United States']);
  });

  it('includes an option guarded by a condition when the condition holds', () => {
    expect(optionsOf(renderSelect(selectWithConditionalOption))).toEqual(['basic:Basic', 'advanced:Advanced']);
  });

  it('renders no options for an empty list without complaint', () => {
    expect(optionsOf(renderSelect(selectOverPossiblyEmptyList))).toEqual([]);
  });

  it('shows the value it is bound to as the current selection', () => {
    expect(renderSelect(selectBoundByValueOnly).value).toBe('uk');
  });

  it('renders without React complaining about a read-only field', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderSelect(basicSelect);
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('select interaction', () => {
  it('records the chosen option against the form field', async () => {
    const user = userEvent.setup();
    render(<div>{renderPtml(selectInForm)}</div>);

    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const chosen = select.options[1].value;
    await user.selectOptions(select, chosen);

    expect(select.value).toBe(chosen);
  });
});
