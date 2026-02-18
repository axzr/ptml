import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { windowScrollTop, windowInvalidOperation, windowMissingData } from './window.example';
import { render as renderPtml, validate } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { ValidatorErrors } from '../../errors/messages';

describe('window action (validation)', () => {
  it('validates window: scrollTop as valid', () => {
    const result = validate(windowScrollTop);
    expect(result.isValid).toBe(true);
  });

  it('rejects unknown window operation', () => {
    const result = validate(windowInvalidOperation);
    expect(result.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(result, ValidatorErrors.windowOperationInvalid, 0, 'badOp', 'scrollTop');
  });

  it('rejects window with no data', () => {
    const result = validate(windowMissingData);
    expect(result.isValid).toBe(false);
  });
});

describe('window action (execution)', () => {
  it('calls window.scrollTo(0, 0) when scrollTop button is clicked', async () => {
    const scrollToSpy = vi.spyOn(globalThis, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    const node = renderPtml(windowScrollTop);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'go to about' });
    await user.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    scrollToSpy.mockRestore();
  });

  it('updates state alongside scrollTop', async () => {
    vi.spyOn(globalThis, 'scrollTo').mockImplementation(() => {});
    const user = userEvent.setup();
    const node = renderPtml(windowScrollTop);
    render(<div>{node}</div>);

    expect(screen.getByText('home')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'go to about' }));

    expect(screen.getByText('about')).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
