import { describe, it, expect } from 'vitest';
import { validate } from '../index';
import { emptyFile, invalidChildIndentTooDeepError } from '../../examples/validation-errors';
import { expectErrorToMatchIgnoringLineNumber } from '../errors/testHelpers';
import { RootNodeErrors, IndentationErrors } from '../errors/messages';

describe('Validation Errors', () => {
  it('rejects empty file', () => {
    const validation = validate(emptyFile);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, RootNodeErrors.emptyFile);
  });

  it('rejects child node with indentation too deep and provides informative error', () => {
    const validation = validate(invalidChildIndentTooDeepError);
    const expectedIndent = 4;
    const actualIndent = 6;
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      IndentationErrors.incorrectIndentation,
      'text',
      0,
      expectedIndent,
      actualIndent,
    );
  });
});
