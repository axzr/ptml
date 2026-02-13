import { describe, it, expect } from 'vitest';
import { invalidPipe } from '../../examples/pipe';
import { validate, parse } from '../index';
import { expectErrorToMatchIgnoringLineNumber } from '../errors/testHelpers';
import { ValidatorErrors } from '../errors/messages';

describe('Invalid pipe function (invalidPipe)', () => {
  it('validates invalidPipe as invalid', () => {
    const validation = validate(invalidPipe);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about unknown pipe function', () => {
    const validation = validate(invalidPipe);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.unknownPipeFunction,
      'set',
      0,
      'unknownPipe',
      '($count 1 | unknownPipe)',
      'add, subtract, multiply, divide, length',
    );
  });

  it('parses invalidPipe into set node with pipe expression', () => {
    const nodes = parse(invalidPipe);
    expect(nodes.length).toBeGreaterThan(0);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const setNode = clickNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$count ($count 1 | unknownPipe)');
  });
});
