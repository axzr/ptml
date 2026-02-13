import { describe, it, expect } from 'vitest';
import { validate } from '../index';
import {
  invalidBoxWithPrecedingSpaces,
  invalidNodeWithPrecedingSpaces,
  invalidLineWithoutDashPrefix,
  invalidBoxWithOddIndent,
  invalidChildIndentTooDeep,
  unknownPropertiesAreInvalid,
  unknownPropertyInStyles,
  boxInStylesIf,
  cssPropertiesInStylesIf,
  setInNonClickNode,
  setInClickNode,
  boxInEachIf,
  cssPropertiesInEachIf,
  unknownRootNode,
  addValueAsDirectChildOfEach,
  callAsDirectChildOfEach,
  rangeAsDirectChildOfBox,
  addValueUnderClick,
  callUnderInit,
  addValueUnderInit,
  setUnderInit,
} from '../../examples/exceptions';
import { ActionErrors, ChildrenErrors, HierarchyErrors, ValidationErrors } from '../errors/messages';
import { formatAllowedChildrenForError } from '../schemaRegistry/formatAllowedChildren';
import { getSchemaMap } from '../schemaRegistry/schemaMap';
import { expectErrorToMatchIgnoringLineNumber } from '../errors/testHelpers';

describe('Invalid PTML Syntax', () => {
  it('rejects root node with preceding spaces', () => {
    const validation = validate(invalidBoxWithPrecedingSpaces);
    expect(validation.isValid).toBe(false);
  });

  it('rejects root node with preceding spaces (generic node)', () => {
    const validation = validate(invalidNodeWithPrecedingSpaces);
    expect(validation.isValid).toBe(false);
  });

  it('rejects indented line without dash prefix', () => {
    const validation = validate(invalidLineWithoutDashPrefix);
    expect(validation.isValid).toBe(false);
  });

  it('rejects child node with odd indentation', () => {
    const validation = validate(invalidBoxWithOddIndent);
    expect(validation.isValid).toBe(false);
  });

  it('rejects child node with indentation too deep', () => {
    const validation = validate(invalidChildIndentTooDeep);
    expect(validation.isValid).toBe(false);
  });

  it('rejects unknown root node types', () => {
    const validation = validate(unknownRootNode);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidationErrors.unknownNodeType, 'declaration', 'unknown', 1);
  });

  it('rejects unknown child node types', () => {
    const validation = validate(unknownPropertiesAreInvalid);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'box',
      0,
      'unknown',
      formatAllowedChildrenForError(getSchemaMap().get('box')!),
    );
  });

  it('allows unknown nodes as children of styles nodes', () => {
    const validation = validate(unknownPropertyInStyles);
    expect(validation.isValid).toBe(true);
  });

  it('rejects box as child of styles->if', () => {
    const validation = validate(boxInStylesIf);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      HierarchyErrors.conditionalInPropertyCannotContain,
      'block',
      'box',
      0,
    );
  });

  it('allows CSS properties as children of styles->if', () => {
    const validation = validate(cssPropertiesInStylesIf);
    expect(validation.isValid).toBe(true);
  });

  it('rejects set as child of non-click node (requires functional context)', () => {
    const validation = validate(setInNonClickNode);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ActionErrors.requiresFunctionalContext, 'set', 0);
  });

  it('allows set as child of click node', () => {
    const validation = validate(setInClickNode);
    expect(validation.isValid).toBe(true);
  });

  it('allows box as child of each->if', () => {
    const validation = validate(boxInEachIf);
    expect(validation.isValid).toBe(true);
  });

  it('rejects CSS properties as children of each->if', () => {
    const validation = validate(cssPropertiesInEachIf);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'if',
      0,
      'color',
      formatAllowedChildrenForError(getSchemaMap().get('if')!),
    );
  });
});

describe('Functional context validation', () => {
  it('rejects addValue as direct child of each (no click/init)', () => {
    const validation = validate(addValueAsDirectChildOfEach);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ActionErrors.requiresFunctionalContext, 'addValue', 0);
  });

  it('rejects call as direct child of each (no click/init)', () => {
    const validation = validate(callAsDirectChildOfEach);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ActionErrors.requiresFunctionalContext, 'call', 0);
  });

  it('rejects range as direct child of box (no click/init)', () => {
    const validation = validate(rangeAsDirectChildOfBox);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ActionErrors.requiresFunctionalContext, 'range', 0);
  });

  it('allows addValue under click', () => {
    const validation = validate(addValueUnderClick);
    expect(validation.isValid).toBe(true);
  });

  it('allows call under init', () => {
    const validation = validate(callUnderInit);
    expect(validation.isValid).toBe(true);
  });

  it('rejects addValue under init (wrong child type)', () => {
    const validation = validate(addValueUnderInit);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'init',
      0,
      'addValue',
      formatAllowedChildrenForError(getSchemaMap().get('init')!),
    );
  });

  it('rejects set under init (wrong child type)', () => {
    const validation = validate(setUnderInit);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ChildrenErrors.wrongChildType,
      'init',
      0,
      'set',
      formatAllowedChildrenForError(getSchemaMap().get('init')!),
    );
  });
});
