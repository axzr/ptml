import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  textWithStyles,
  textWithStylesWithColon,
  boxWithStyles,
  rootStylesWithNoData,
  namedStyles,
  namedStylesWithOverride,
  invalidIfCondition,
  conditionalStyles,
  namedConditionalStyles,
  invalidComparison,
  invalidComparison2,
  invalidComparison3,
  invalidComparison4,
  namedStylesInspectLoopsForVariables,
  conditionInList,
  inlineStylesWithBreakpoint,
  stylesWithStateInterpolation,
} from './styles.example';
import { render as renderPtml, validate, parse } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { BreakpointsErrors, DataFormatErrors, ValidatorErrors, VariableErrors } from '../../errors/messages';
import type { Node } from '../../types';

describe('Styles', () => {
  it('validates textWithStyles', () => {
    const validation = validate(textWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses textWithStyles into text node with styles children', () => {
    const nodes = parse(textWithStyles);
    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const root = ptmlNode?.children.find((n) => n.type === 'text') as Node;
    expect(root).toBeDefined();
    expect(root.type).toBe('text');
    expect(root.data).toBe('this is text with children styles');

    expect(root.children).toHaveLength(1);
    const stylesNode = root.children[0];
    expect(stylesNode.type).toBe('styles');

    expect(stylesNode.children).toHaveLength(2);
    const [fontFamilyNode, fontSizeNode] = stylesNode.children;
    expect(fontFamilyNode.type).toBe('font-family');
    expect(fontFamilyNode.data).toBe('Arial, sans-serif');
    expect(fontSizeNode.type).toBe('font-size');
    expect(fontSizeNode.data).toBe('16px');
  });

  it('applies styles when rendering textWithStyles', () => {
    const node = renderPtml(textWithStyles);
    render(<div>{node}</div>);

    const el = screen.getByText('this is text with children styles');
    expect(el).toHaveStyle('font-family: Arial, sans-serif');
    expect(el).toHaveStyle('font-size: 16px');
  });

  it('validates textWithStylesWithColon', () => {
    const validation = validate(textWithStylesWithColon);
    expect(validation.isValid).toBe(true);
  });

  it('parses textWithStylesWithColon into text node with styles children', () => {
    const nodes = parse(textWithStylesWithColon);
    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const root = ptmlNode?.children.find((n) => n.type === 'text') as Node;
    expect(root).toBeDefined();
    expect(root.type).toBe('text');
    expect(root.data).toBe('this is text with children styles with colon');

    expect(root.children).toHaveLength(1);
    const stylesNode = root.children[0];
    expect(stylesNode.type).toBe('styles');

    expect(stylesNode.children).toHaveLength(2);
    const [fontFamilyNode, fontSizeNode] = stylesNode.children;
    expect(fontFamilyNode.type).toBe('font-family');
    expect(fontFamilyNode.data).toBe('Arial, sans-serif');
    expect(fontSizeNode.type).toBe('font-size');
    expect(fontSizeNode.data).toBe('16px');
  });

  it('applies styles when rendering textWithStylesWithColon', () => {
    const node = renderPtml(textWithStylesWithColon);
    render(<div>{node}</div>);

    const el = screen.getByText('this is text with children styles with colon');
    expect(el).toHaveStyle('font-family: Arial, sans-serif');
    expect(el).toHaveStyle('font-size: 16px');
  });

  it('validates boxWithStyles', () => {
    const validation = validate(boxWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses boxWithStyles into box node with styles and text child', () => {
    const nodes = parse(boxWithStyles);
    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const root = ptmlNode?.children.find((n) => n.type === 'box') as Node;
    expect(root).toBeDefined();
    expect(root.type).toBe('box');

    expect(root.children).toHaveLength(2);

    const stylesNode = root.children[0];
    expect(stylesNode.type).toBe('styles');
    expect(stylesNode.children).toHaveLength(3);

    const [colorNode, backgroundColorNode, fontWeightNode] = stylesNode.children;
    expect(colorNode.type).toBe('color');
    expect(colorNode.data).toBe('red');
    expect(backgroundColorNode.type).toBe('background-color');
    expect(backgroundColorNode.data).toBe('blue');
    expect(fontWeightNode.type).toBe('font-weight');
    expect(fontWeightNode.data).toBe('bold');

    const textNode = root.children[1];
    expect(textNode.type).toBe('text');
    expect(textNode.data).toBe('this is text with styles');

    expect(textNode.children).toHaveLength(1);
    const textStylesNode = textNode.children[0];
    expect(textStylesNode.type).toBe('styles');
    expect(textStylesNode.children).toHaveLength(2);

    const [textColorNode, textFontSizeNode] = textStylesNode.children;
    expect(textColorNode.type).toBe('color');
    expect(textColorNode.data).toBe('green');
    expect(textFontSizeNode.type).toBe('font-size');
    expect(textFontSizeNode.data).toBe('36px');
  });

  it('applies styles when rendering boxWithStyles', () => {
    const node = renderPtml(boxWithStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this is text with styles');
    expect(textEl).toHaveStyle('color: rgb(0, 128, 0)');
    expect(textEl).toHaveStyle('font-size: 36px');
  });

  it('rejects root styles node without a name, with informative error', () => {
    const validation = validate(rootStylesWithNoData);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      DataFormatErrors.missingRequiredPart,
      'define',
      0,
      'style-name',
      'Style name (required). Must be a valid identifier that can be referenced from styles properties.',
    );
  });

  it('validates namedStyles', () => {
    const validation = validate(namedStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses namedStyles into root styles definition and referencing text', () => {
    const nodes = parse(namedStyles);
    expect(nodes.length).toBe(2);

    const stylesRoot = nodes[0] as Node;
    expect(stylesRoot.type).toBe('define');
    expect(stylesRoot.data).toBe('named-styles');
    expect(stylesRoot.children).toHaveLength(3);

    const [colorNode, backgroundColorNode, fontWeightNode] = stylesRoot.children;
    expect(colorNode.type).toBe('color');
    expect(colorNode.data).toBe('red');
    expect(backgroundColorNode.type).toBe('background-color');
    expect(backgroundColorNode.data).toBe('blue');
    expect(fontWeightNode.type).toBe('font-weight');
    expect(fontWeightNode.data).toBe('bold');

    const ptmlNode = nodes[1] as Node;
    expect(ptmlNode.type).toBe('ptml');
    const textNode = ptmlNode.children.find((n) => n.type === 'text') as Node;
    expect(textNode).toBeDefined();
    expect(textNode.type).toBe('text');
    expect(textNode.data).toBe('text with named styles');
    expect(textNode.children).toHaveLength(1);

    const textStylesNode = textNode.children[0];
    expect(textStylesNode.type).toBe('styles');
    expect(textStylesNode.data).toBe('named-styles');
    expect(textStylesNode.children).toHaveLength(0);
  });

  it('applies namedStyles when rendering namedStyles', () => {
    const node = renderPtml(namedStyles);
    render(<div>{node}</div>);

    const el = screen.getByText('text with named styles');
    expect(el).toHaveStyle('color: rgb(255, 0, 0)');
    expect(el).toHaveStyle('background-color: rgb(0, 0, 255)');
    expect(el).toHaveStyle('font-weight: bold');
  });

  it('applies overrides when rendering namedStylesWithOverride', () => {
    const node = renderPtml(namedStylesWithOverride);
    render(<div>{node}</div>);

    const el = screen.getByText('text with named styles - it should be green with a blue background');
    expect(el).toHaveStyle('color: rgb(0, 128, 0)');
    expect(el).toHaveStyle('background-color: rgb(0, 0, 255)');
    expect(el).toHaveStyle('font-weight: bold');
  });

  it('rejects if node without $ prefix on variable name', () => {
    const validation = validate(invalidIfCondition);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for invalid if node (missing $ prefix on variable)', () => {
    const validation = validate(invalidIfCondition);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.ifConditionVariableName, 'if', 0, 'isActive');
  });

  it('validates conditionalStyles', () => {
    const validation = validate(conditionalStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses conditionalStyles with if and else nodes in styles', () => {
    const nodes = parse(conditionalStyles);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((node) => node.type === 'text');
    expect(textNode).toBeDefined();

    const stylesNode = textNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();

    const ifNode = stylesNode?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$isActive');

    const elseNode = stylesNode?.children.find((child) => child.type === 'else');
    expect(elseNode).toBeDefined();
  });

  it('renders conditionalStyles with else branch styles when condition is false', () => {
    const node = renderPtml(conditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    expect(textEl).toHaveStyle('font-weight: bold');
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');
    expect(textEl).not.toHaveStyle('color: rgb(255, 0, 0)');
    expect(textEl).not.toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('applies if branch styles when condition becomes true', async () => {
    const user = userEvent.setup();
    const node = renderPtml(conditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');

    const button = screen.getByRole('button', { name: 'toggle the state' });
    await user.click(button);

    expect(textEl).toHaveStyle('color: rgb(0, 128, 0)');
    expect(textEl).not.toHaveStyle('color: rgb(0, 0, 255)');
    expect(textEl).not.toHaveStyle('color: rgb(255, 0, 0)');
  });

  it('toggles between if and else branch styles on multiple clicks', async () => {
    const user = userEvent.setup();
    const node = renderPtml(conditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    const button = screen.getByRole('button', { name: 'toggle the state' });

    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');

    await user.click(button);
    expect(textEl).toHaveStyle('color: rgb(0, 128, 0)');

    await user.click(button);
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('validates namedConditionalStyles', () => {
    const validation = validate(namedConditionalStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses namedConditionalStyles with conditional logic in named style definition', () => {
    const nodes = parse(namedConditionalStyles);
    expect(nodes.length).toBeGreaterThanOrEqual(3);

    const stylesRoot = nodes.find((node) => node.type === 'define' && node.data === 'active-styles');
    expect(stylesRoot).toBeDefined();

    const ifNode = stylesRoot?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$isActive');

    const elseNode = stylesRoot?.children.find((child) => child.type === 'else');
    expect(elseNode).toBeDefined();

    const colorNode = stylesRoot?.children.find((child) => child.type === 'color');
    expect(colorNode).toBeDefined();
    expect(colorNode?.data).toBe('red');
  });

  it('renders namedConditionalStyles with else branch styles when condition is false', () => {
    const node = renderPtml(namedConditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    expect(textEl).toHaveStyle('font-weight: bold');
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');
    expect(textEl).not.toHaveStyle('color: rgb(255, 0, 0)');
    expect(textEl).not.toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('applies if branch styles when condition becomes true', async () => {
    const user = userEvent.setup();
    const node = renderPtml(namedConditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');

    const button = screen.getByRole('button', { name: 'toggle the state' });
    await user.click(button);

    expect(textEl).toHaveStyle('color: rgb(0, 128, 0)');
    expect(textEl).not.toHaveStyle('color: rgb(0, 0, 255)');
    expect(textEl).not.toHaveStyle('color: rgb(255, 0, 0)');
  });

  it('toggles between if and else branch styles on multiple clicks', async () => {
    const user = userEvent.setup();
    const node = renderPtml(namedConditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    const button = screen.getByRole('button', { name: 'toggle the state' });

    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');

    await user.click(button);
    expect(textEl).toHaveStyle('color: rgb(0, 128, 0)');

    await user.click(button);
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('merges named conditional styles with override properties', () => {
    const node = renderPtml(namedConditionalStyles);
    render(<div>{node}</div>);

    const textEl = screen.getByText('this text indicates if the state is active (it should never be red)');
    expect(textEl).toHaveStyle('font-weight: bold');
    expect(textEl).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('rejects invalidComparison with missing $ prefix in comparison expression', () => {
    const validation = validate(invalidComparison);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for invalid comparison expression', () => {
    const validation = validate(invalidComparison);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.ifConditionComparisonVariableName,
      'if',
      0,
      'isActive',
    );
  });
});

describe('Styles (invalidComparison2)', () => {
  it('rejects invalidComparison2 with undefined state variable in comparison expression', () => {
    const validation = validate(invalidComparison2);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for undefined state variable in comparison', () => {
    const validation = validate(invalidComparison2);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.undefinedStateVariable, 'if', 0, 'isActive');
  });

  it('parses invalidComparison2 into nodes despite validation error', () => {
    const nodes = parse(invalidComparison2);
    expect(nodes.length).toBeGreaterThan(0);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((n) => n.type === 'text');
    expect(textNode).toBeDefined();

    const stylesNode = textNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();

    const ifNode = stylesNode?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$isActive is $index');
  });
});

describe('Styles (invalidComparison3)', () => {
  it('rejects invalidComparison3 with undefined loop variable used outside loop context', () => {
    const validation = validate(invalidComparison3);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for undefined loop variable in comparison', () => {
    const validation = validate(invalidComparison3);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.undefinedStateVariable, 'if', 0, 'index');
  });

  it('parses invalidComparison3 into nodes despite validation error', () => {
    const nodes = parse(invalidComparison3);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const isActiveChild = stateNode?.children.find((c) => c.type === 'isActive');
    expect(isActiveChild).toBeDefined();
    expect(isActiveChild?.data).toBe('false');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const textNode = ptmlNode?.children.find((n) => n.type === 'text');
    expect(textNode).toBeDefined();

    const stylesNode = textNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();

    const ifNode = stylesNode?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$isActive is $index');
  });
});

describe('Styles (invalidComparison4)', () => {
  it('rejects invalidComparison4 with undefined loop variable in named style', () => {
    const validation = validate(invalidComparison4);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for undefined loop variable in named style comparison', () => {
    const validation = validate(invalidComparison4);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.undefinedStateVariable, 'if', 0, 'index');
  });

  it('parses invalidComparison4 into nodes despite validation error', () => {
    const nodes = parse(invalidComparison4);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const activeItemChild = stateNode?.children.find((c) => c.type === 'activeItem');
    expect(activeItemChild).toBeDefined();
    expect(activeItemChild?.data).toBe('0');

    const stylesNode = nodes.find((n) => n.type === 'define' && n.data === 'active-item');
    expect(stylesNode).toBeDefined();

    const ifNode = stylesNode?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$activeItem is $index');
  });
});

describe('Styles (namedStylesInspectLoopsForVariables)', () => {
  it('validates namedStylesInspectLoopsForVariables as valid (named style with loop variable defined later)', () => {
    const validation = validate(namedStylesInspectLoopsForVariables);
    expect(validation.isValid).toBe(true);
  });

  it('parses namedStylesInspectLoopsForVariables into state, list, styles, box, and each nodes', () => {
    const nodes = parse(namedStylesInspectLoopsForVariables);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const activeItemChild = stateNode?.children.find((c) => c.type === 'activeItem');
    expect(activeItemChild).toBeDefined();
    expect(activeItemChild?.data).toBe('0');

    const listNode = nodes.find((n) => n.type === 'valueList' || (n.type === 'items' && n.children.length > 0));
    expect(listNode).toBeDefined();

    const stylesNode = nodes.find((n) => n.type === 'define' && n.data === 'active-item');
    expect(stylesNode).toBeDefined();

    const ifNode = stylesNode?.children.find((child) => child.type === 'if');
    expect(ifNode).toBeDefined();
    expect(ifNode?.data).toBe('$activeItem is $index');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const eachNode = boxNode?.children.find((child) => child.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('items as $item, index as $index');
  });

  it('renders namedStylesInspectLoopsForVariables with all list items', () => {
    const node = renderPtml(namedStylesInspectLoopsForVariables);
    render(<div>{node}</div>);

    expect(screen.getByText('item 1')).toBeInTheDocument();
    expect(screen.getByText('item 2')).toBeInTheDocument();
    expect(screen.getByText('item 3')).toBeInTheDocument();
  });

  it('applies green color to item 1 when activeItem (0) matches index (0)', () => {
    const node = renderPtml(namedStylesInspectLoopsForVariables);
    render(<div>{node}</div>);

    const item1 = screen.getByText('item 1');
    const item1Parent = item1.closest('div');

    expect(item1Parent).toBeInTheDocument();
    expect(item1Parent).toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('applies blue color to items 2 and 3 when activeItem (0) does not match their indices', () => {
    const node = renderPtml(namedStylesInspectLoopsForVariables);
    render(<div>{node}</div>);

    const item2 = screen.getByText('item 2');
    const item3 = screen.getByText('item 3');

    const item2Parent = item2.closest('div');
    const item3Parent = item3.closest('div');

    expect(item2Parent).toBeInTheDocument();
    expect(item3Parent).toBeInTheDocument();
    expect(item2Parent).toHaveStyle('color: rgb(0, 0, 255)');
    expect(item3Parent).toHaveStyle('color: rgb(0, 0, 255)');
  });
});

describe('Styles (conditionInList)', () => {
  it('validates conditionInList as valid', () => {
    const validation = validate(conditionInList);
    expect(validation.isValid).toBe(true);
  });

  it('parses conditionInList into list, state, styles, box, each, text, and button nodes', () => {
    const nodes = parse(conditionInList);
    expect(nodes.length).toBeGreaterThan(0);

    const listNode = nodes.find((n) => n.type === 'valueList' && n.data === 'items');
    expect(listNode).toBeDefined();

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const activeItemChild = stateNode?.children.find((c) => c.type === 'activeItem');
    expect(activeItemChild).toBeDefined();
    expect(activeItemChild?.data).toBe('0');

    const stylesNode = nodes.find((n) => n.type === 'define' && n.data === 'active-item');
    expect(stylesNode).toBeDefined();

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const eachNode = boxNode?.children.find((child) => child.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('items as $item, index as $index');

    const innerBoxNode = eachNode?.children.find((child) => child.type === 'box');
    expect(innerBoxNode).toBeDefined();

    const textNode = innerBoxNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('$item');

    const buttonNode = innerBoxNode?.children.find((child) => child.type === 'button');
    expect(buttonNode).toBeDefined();
  });

  it('renders conditionInList with all list items', () => {
    const node = renderPtml(conditionInList);
    render(<div>{node}</div>);

    expect(screen.getByText('item 1')).toBeInTheDocument();
    expect(screen.getByText('item 2')).toBeInTheDocument();
    expect(screen.getByText('item 3')).toBeInTheDocument();
  });

  it('applies green color to item 1 text when activeItem (0) matches index (0)', () => {
    const node = renderPtml(conditionInList);
    render(<div>{node}</div>);

    const item1 = screen.getByText('item 1');
    const item1Span = item1.closest('span');

    expect(item1Span).toBeInTheDocument();
    expect(item1Span).toHaveStyle('color: rgb(0, 128, 0)');
  });

  it('applies blue color to items 2 and 3 text when activeItem (0) does not match their indices', () => {
    const node = renderPtml(conditionInList);
    render(<div>{node}</div>);

    const item2 = screen.getByText('item 2');
    const item3 = screen.getByText('item 3');

    const item2Span = item2.closest('span');
    const item3Span = item3.closest('span');

    expect(item2Span).toBeInTheDocument();
    expect(item3Span).toBeInTheDocument();
    expect(item2Span).toHaveStyle('color: rgb(0, 0, 255)');
    expect(item3Span).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('updates text colors when button is clicked to change activeItem', async () => {
    const user = userEvent.setup();
    const node = renderPtml(conditionInList);
    render(<div>{node}</div>);

    const item1 = screen.getByText('item 1');
    const item2 = screen.getByText('item 2');
    const item3 = screen.getByText('item 3');

    const item1Span = item1.closest('span');
    const item2Span = item2.closest('span');
    const item3Span = item3.closest('span');

    expect(item1Span).toHaveStyle('color: rgb(0, 128, 0)');
    expect(item2Span).toHaveStyle('color: rgb(0, 0, 255)');
    expect(item3Span).toHaveStyle('color: rgb(0, 0, 255)');

    const selectButton2 = screen.getAllByRole('button', { name: 'Select' })[1];
    await user.click(selectButton2);

    expect(item1Span).toHaveStyle('color: rgb(0, 0, 255)');
    expect(item2Span).toHaveStyle('color: rgb(0, 128, 0)');
    expect(item3Span).toHaveStyle('color: rgb(0, 0, 255)');
  });

  it('renders Select buttons for each item', () => {
    const node = renderPtml(conditionInList);
    render(<div>{node}</div>);

    const buttons = screen.getAllByRole('button', { name: 'Select' });
    expect(buttons).toHaveLength(3);
  });

  it('rejects breakpoint as direct child of inline styles', () => {
    const validation = validate(inlineStylesWithBreakpoint);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, BreakpointsErrors.stylesCannotContainBreakpoint, 0);
  });

  it('validates stylesWithStateInterpolation', () => {
    const validation = validate(stylesWithStateInterpolation);
    expect(validation.isValid).toBe(true);
  });

  it('applies styles from state when CSS values use $ variable references', () => {
    const node = renderPtml(stylesWithStateInterpolation);
    render(<div>{node}</div>);

    const el = screen.getByText('styled from state');
    expect(el).toHaveStyle({ color: 'rgb(230, 0, 126)', fontSize: '20px' });
  });
});
