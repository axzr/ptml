import { describe, it, expect } from 'vitest';
import {
  invalidFunctionNoName,
  invalidFunctionWithRepeatedParams,
  invalidFunctionWithDollarSignOnName,
  invalidFunctionWithDollarSignOnParameter,
  functionThatUpdatesState,
  namedFunction,
  functionVariable,
  addDigit,
  clearInput,
} from './function.example';
import { multiSet, multiSetFunction, invalidSet } from '../set/set.example';
import { invalidFunctionCall, invalidFunctionCall2, invalidRunTimeFunctionCall } from '../call/call.example';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { validate, parse, render as renderPtml } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { DataFormatErrors, ValidatorErrors, VariableErrors } from '../../errors/messages';

describe('Invalid function no name (invalidFunctionNoName)', () => {
  it('validates invalidFunctionNoName as invalid', () => {
    const validation = validate(invalidFunctionNoName);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about missing function name', () => {
    const validation = validate(invalidFunctionNoName);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      DataFormatErrors.missingRequiredPart,
      'function',
      0,
      'function name',
      'The name of the function. Cannot start with $. Function names must be unique within the document.',
    );
  });

  it('parses invalidFunctionNoName into function node', () => {
    const nodes = parse(invalidFunctionNoName);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('');
  });
});

describe('Invalid function with repeated params (invalidFunctionWithRepeatedParams)', () => {
  it('validates invalidFunctionWithRepeatedParams as invalid', () => {
    const validation = validate(invalidFunctionWithRepeatedParams);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about duplicate parameters', () => {
    const validation = validate(invalidFunctionWithRepeatedParams);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      DataFormatErrors.duplicateParts,
      'function',
      0,
      'parameter',
      'value',
    );
  });

  it('parses invalidFunctionWithRepeatedParams into function node', () => {
    const nodes = parse(invalidFunctionWithRepeatedParams);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('add value other value');
  });
});

describe('Invalid function with dollar sign on name (invalidFunctionWithDollarSignOnName)', () => {
  it('validates invalidFunctionWithDollarSignOnName as invalid', () => {
    const validation = validate(invalidFunctionWithDollarSignOnName);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about dollar sign in function name', () => {
    const validation = validate(invalidFunctionWithDollarSignOnName);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.functionNameStartsWithDollar,
      'function',
      0,
      '$add',
    );
  });

  it('parses invalidFunctionWithDollarSignOnName into function node', () => {
    const nodes = parse(invalidFunctionWithDollarSignOnName);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('$add value other');
  });
});

describe('Invalid function with dollar sign on parameter (invalidFunctionWithDollarSignOnParameter)', () => {
  it('validates invalidFunctionWithDollarSignOnParameter as invalid', () => {
    const validation = validate(invalidFunctionWithDollarSignOnParameter);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about dollar sign in parameter', () => {
    const validation = validate(invalidFunctionWithDollarSignOnParameter);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      ValidatorErrors.parameterNameStartsWithDollar,
      'function',
      0,
      '$value',
    );
  });

  it('parses invalidFunctionWithDollarSignOnParameter into function node', () => {
    const nodes = parse(invalidFunctionWithDollarSignOnParameter);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function');
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('add $value other');
  });
});

describe('Function that updates state (functionThatUpdatesState)', () => {
  it('validates functionThatUpdatesState', () => {
    const validation = validate(functionThatUpdatesState);
    expect(validation.isValid).toBe(true);
  });

  it('parses functionThatUpdatesState into state, function, button, click, call, box, and text nodes', () => {
    const nodes = parse(functionThatUpdatesState);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const valueChild = stateNode?.children.find((c) => c.type === 'value');
    expect(valueChild).toBeDefined();
    expect(valueChild?.data).toBe('0');

    const functionNode = nodes.find((n) => n.type === 'function' && n.data === 'increment');
    expect(functionNode).toBeDefined();
    expect(functionNode?.children).toHaveLength(1);

    const setNode = functionNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$value ($value 1 | add)');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();
    expect(clickNode?.children).toHaveLength(1);

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('increment');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const textNode = boxNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('value is $value');
  });

  it('renders functionThatUpdatesState with initial value', () => {
    const node = renderPtml(functionThatUpdatesState);
    render(<div>{node}</div>);

    expect(screen.getByRole('button', { name: 'increment' })).toBeInTheDocument();
    expect(screen.getByText('value is 0')).toBeInTheDocument();
  });

  it('increments value when increment button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionThatUpdatesState);
    render(<div>{node}</div>);

    expect(screen.getByText('value is 0')).toBeInTheDocument();

    const incrementButton = screen.getByRole('button', { name: 'increment' });
    await user.click(incrementButton);

    expect(screen.getByText('value is 1')).toBeInTheDocument();
    expect(screen.queryByText('value is 0')).not.toBeInTheDocument();
  });

  it('increments value multiple times when button is clicked repeatedly', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionThatUpdatesState);
    render(<div>{node}</div>);

    const incrementButton = screen.getByRole('button', { name: 'increment' });

    await user.click(incrementButton);
    expect(screen.getByText('value is 1')).toBeInTheDocument();

    await user.click(incrementButton);
    expect(screen.getByText('value is 2')).toBeInTheDocument();

    await user.click(incrementButton);
    expect(screen.getByText('value is 3')).toBeInTheDocument();
  });
});

describe('Multiple set operations (multiSet)', () => {
  it('validates multiSet', () => {
    const validation = validate(multiSet);
    expect(validation.isValid).toBe(true);
  });

  it('parses multiSet into state nodes, box, button, click, and multiple set nodes', () => {
    const nodes = parse(multiSet);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const xChild = stateNode?.children.find((c) => c.type === 'x');
    expect(xChild).toBeDefined();
    expect(xChild?.data).toBe('1');
    const yChild = stateNode?.children.find((c) => c.type === 'y');
    expect(yChild).toBeDefined();
    expect(yChild?.data).toBe('2');
    const zChild = stateNode?.children.find((c) => c.type === 'z');
    expect(zChild).toBeDefined();
    expect(zChild?.data).toBe('3');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const buttonNode = boxNode?.children.find((child) => child.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();
    expect(clickNode?.children.length).toBe(3);

    const setNodes = clickNode?.children.filter((child) => child.type === 'set');
    expect(setNodes).toHaveLength(3);
    expect(setNodes?.map((n) => n.data)).toEqual(['$x 0', '$y 0', '$z 0']);
  });

  it('renders multiSet with initial state values', () => {
    const node = renderPtml(multiSet);
    render(<div>{node}</div>);

    expect(screen.getByText(/x is 1/)).toBeInTheDocument();
    expect(screen.getByText(/y is 2/)).toBeInTheDocument();
    expect(screen.getByText(/z is 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
  });

  it('sets all values to 0 when Clear all button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(multiSet);
    render(<div>{node}</div>);

    expect(screen.getByText(/x is 1/)).toBeInTheDocument();
    expect(screen.getByText(/y is 2/)).toBeInTheDocument();
    expect(screen.getByText(/z is 3/)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: 'Clear all' });
    await user.click(clearButton);

    expect(screen.getByText(/x is 0/)).toBeInTheDocument();
    expect(screen.getByText(/y is 0/)).toBeInTheDocument();
    expect(screen.getByText(/z is 0/)).toBeInTheDocument();
    expect(screen.queryByText(/x is 1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/y is 2/)).not.toBeInTheDocument();
    expect(screen.queryByText(/z is 3/)).not.toBeInTheDocument();
  });
});

describe('Multiple set operations in function (multiSetFunction)', () => {
  it('validates multiSetFunction', () => {
    const validation = validate(multiSetFunction);
    expect(validation.isValid).toBe(true);
  });

  it('parses multiSetFunction into state nodes, function, box, button, click, and call nodes', () => {
    const nodes = parse(multiSetFunction);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const xChild = stateNode?.children.find((c) => c.type === 'x');
    expect(xChild).toBeDefined();
    expect(xChild?.data).toBe('1');
    const yChild = stateNode?.children.find((c) => c.type === 'y');
    expect(yChild).toBeDefined();
    expect(yChild?.data).toBe('2');

    const zChild = stateNode?.children.find((c) => c.type === 'z');
    expect(zChild).toBeDefined();
    expect(zChild?.data).toBe('3');

    const functionNode = nodes.find((n) => n.type === 'function' && n.data === 'clear');
    expect(functionNode).toBeDefined();
    expect(functionNode?.children.length).toBe(3);

    const setNodes = functionNode?.children.filter((child) => child.type === 'set');
    expect(setNodes).toHaveLength(3);
    expect(setNodes?.map((n) => n.data)).toEqual(['$x 0', '$y 0', '$z 0']);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const buttonNode = boxNode?.children.find((child) => child.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();
    expect(clickNode?.children.length).toBe(1);

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('clear');
  });

  it('renders multiSetFunction with initial state values', () => {
    const node = renderPtml(multiSetFunction);
    render(<div>{node}</div>);

    expect(screen.getByText(/x is 1/)).toBeInTheDocument();
    expect(screen.getByText(/y is 2/)).toBeInTheDocument();
    expect(screen.getByText(/z is 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear all' })).toBeInTheDocument();
  });

  it('sets all values to 0 when Clear all button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(multiSetFunction);
    render(<div>{node}</div>);

    expect(screen.getByText(/x is 1/)).toBeInTheDocument();
    expect(screen.getByText(/y is 2/)).toBeInTheDocument();
    expect(screen.getByText(/z is 3/)).toBeInTheDocument();

    const clearButton = screen.getByRole('button', { name: 'Clear all' });
    await user.click(clearButton);

    expect(screen.getByText(/x is 0/)).toBeInTheDocument();
    expect(screen.getByText(/y is 0/)).toBeInTheDocument();
    expect(screen.getByText(/z is 0/)).toBeInTheDocument();
    expect(screen.queryByText(/x is 1/)).not.toBeInTheDocument();
    expect(screen.queryByText(/y is 2/)).not.toBeInTheDocument();
    expect(screen.queryByText(/z is 3/)).not.toBeInTheDocument();
  });
});

describe('Invalid set node (invalidSet)', () => {
  it('validates invalidSet as invalid', () => {
    const validation = validate(invalidSet);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about missing dollar sign', () => {
    const validation = validate(invalidSet);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(
      validation,
      VariableErrors.variableNameMustStartWithDollar,
      'set',
      0,
      'display',
    );
  });

  it('parses invalidSet into function node with set child', () => {
    const nodes = parse(invalidSet);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('addDigit'));
    expect(functionNode).toBeDefined();

    const setNode = functionNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('display ($display 10 | multiply) $digit | add');
  });
});

describe('Named function with parameter (namedFunction)', () => {
  it('validates namedFunction', () => {
    const validation = validate(namedFunction);
    expect(validation.isValid).toBe(true);
  });

  it('parses namedFunction into function node with parameter and set child', () => {
    const nodes = parse(namedFunction);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('addDigit'));
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('addDigit digit');
    expect(functionNode?.children.length).toBe(1);

    const setNode = functionNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$display ($display $digit | add)');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const buttonNode = boxNode?.children.find((child) => child.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('addDigit 1');
  });

  it('renders namedFunction with initial state value', () => {
    const node = renderPtml(namedFunction);
    render(<div>{node}</div>);

    expect(screen.getByText(/display is 0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'add 1' })).toBeInTheDocument();
  });

  it('adds digit to display when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(namedFunction);
    render(<div>{node}</div>);

    expect(screen.getByText(/display is 0/)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'add 1' });
    await user.click(button);

    expect(screen.getByText(/display is 1/)).toBeInTheDocument();
    expect(screen.queryByText(/display is 0/)).not.toBeInTheDocument();
  });

  it('adds digit multiple times when button is clicked repeatedly', async () => {
    const user = userEvent.setup();
    const node = renderPtml(namedFunction);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'add 1' });

    await user.click(button);
    expect(screen.getByText(/display is 1/)).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText(/display is 2/)).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText(/display is 3/)).toBeInTheDocument();
  });
});

describe('Function variable (functionVariable)', () => {
  it('validates functionVariable', () => {
    const validation = validate(functionVariable);
    expect(validation.isValid).toBe(true);
  });

  it('parses functionVariable into state, list, function, box, each, button, click, and call nodes', () => {
    const nodes = parse(functionVariable);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNodes = nodes.filter((n) => n.type === 'state');
    expect(stateNodes.length).toBe(2);
    const valueStateNode = stateNodes.find((n) => n.children.some((c) => c.type === 'value'));
    expect(valueStateNode).toBeDefined();
    const valueChild = valueStateNode?.children.find((c) => c.type === 'value');
    expect(valueChild).toBeDefined();
    expect(valueChild?.data).toBe('0');
    const currentFunctionStateNode = stateNodes.find((n) => n.children.some((c) => c.type === 'currentFunction'));
    expect(currentFunctionStateNode).toBeDefined();
    const currentFunctionChild = currentFunctionStateNode?.children.find((c) => c.type === 'currentFunction');
    expect(currentFunctionChild).toBeDefined();
    expect(currentFunctionChild?.data).toBe('increment');

    const functionsListNode = nodes.find((n) => n.type === 'valueList' && n.data === 'functions');
    expect(functionsListNode).toBeDefined();

    const incrementFunctionNode = nodes.find((n) => n.type === 'function' && n.data === 'increment');
    expect(incrementFunctionNode).toBeDefined();
    expect(incrementFunctionNode?.children.length).toBe(1);

    const decrementFunctionNode = nodes.find((n) => n.type === 'function' && n.data === 'decrement');
    expect(decrementFunctionNode).toBeDefined();
    expect(decrementFunctionNode?.children.length).toBe(1);

    const setFunctionFunctionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('setFunction'));
    expect(setFunctionFunctionNode).toBeDefined();
    expect(setFunctionFunctionNode?.data).toBe('setFunction newFunction');
    expect(setFunctionFunctionNode?.children.length).toBe(1);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const innerBox = boxNode?.children.find((child) => child.type === 'box');
    expect(innerBox).toBeDefined();

    const eachNode = innerBox?.children.find((child) => child.type === 'each');
    expect(eachNode).toBeDefined();
    expect(eachNode?.data).toBe('functions as $function');

    const buttonInEach = eachNode?.children.find((child) => child.type === 'button');
    expect(buttonInEach).toBeDefined();

    const clickInEach = buttonInEach?.children.find((child) => child.type === 'click');
    expect(clickInEach).toBeDefined();

    const callInEach = clickInEach?.children.find((child) => child.type === 'call');
    expect(callInEach).toBeDefined();
    expect(callInEach?.data).toBe('setFunction $function');

    const secondBox = boxNode?.children.filter((child) => child.type === 'box')[1];
    expect(secondBox).toBeDefined();

    const buttonWithVariableCall = secondBox?.children.find((child) => child.type === 'button');
    expect(buttonWithVariableCall).toBeDefined();

    const clickWithVariableCall = buttonWithVariableCall?.children.find((child) => child.type === 'click');
    expect(clickWithVariableCall).toBeDefined();

    const callWithVariable = clickWithVariableCall?.children.find((child) => child.type === 'call');
    expect(callWithVariable).toBeDefined();
    expect(callWithVariable?.data).toBe('$currentFunction');
  });

  it('renders functionVariable with initial state', () => {
    const node = renderPtml(functionVariable);
    render(<div>{node}</div>);

    expect(screen.getByText(/value is 0/)).toBeInTheDocument();
    expect(screen.getAllByText(/increment/).length).toBeGreaterThan(0);
    expect(screen.getByText(/set currentFunction to increment/)).toBeInTheDocument();
    expect(screen.getByText(/set currentFunction to decrement/)).toBeInTheDocument();
  });

  it('updates currentFunction when setFunction button is clicked with loop variable', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionVariable);
    render(<div>{node}</div>);

    expect(screen.getAllByText(/increment/).length).toBeGreaterThan(0);

    const decrementButton = screen.getByRole('button', { name: /set currentFunction to decrement/ });
    await user.click(decrementButton);

    expect(screen.getAllByText(/decrement/).length).toBeGreaterThan(0);
  });

  it('calls function stored in currentFunction variable when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionVariable);
    render(<div>{node}</div>);

    expect(screen.getByText(/value is 0/)).toBeInTheDocument();

    const executeButtons = screen.getAllByRole('button', { name: /increment/ });
    const executeButton = executeButtons.find((btn) => btn.textContent === 'increment');
    expect(executeButton).toBeDefined();
    await user.click(executeButton!);

    expect(screen.getByText(/value is 1/)).toBeInTheDocument();
    expect(screen.queryByText(/value is 0/)).not.toBeInTheDocument();
  });

  it('changes function and executes new function when currentFunction is updated', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionVariable);
    render(<div>{node}</div>);

    expect(screen.getByText(/value is 0/)).toBeInTheDocument();

    const setToDecrementButton = screen.getByRole('button', { name: /set currentFunction to decrement/ });
    await user.click(setToDecrementButton);

    expect(screen.getAllByText(/decrement/).length).toBeGreaterThan(0);

    const executeButtons = screen.getAllByRole('button', { name: /decrement/ });
    const executeButton = executeButtons.find((btn) => btn.textContent === 'decrement');
    expect(executeButton).toBeDefined();
    await user.click(executeButton!);

    expect(screen.getByText(/value is -1/)).toBeInTheDocument();
  });

  it('executes function multiple times correctly', async () => {
    const user = userEvent.setup();
    const node = renderPtml(functionVariable);
    render(<div>{node}</div>);

    const executeButtons = screen.getAllByRole('button', { name: /increment/ });
    const executeButton = executeButtons.find((btn) => btn.textContent === 'increment');
    expect(executeButton).toBeDefined();

    await user.click(executeButton!);
    expect(screen.getByText(/value is 1/)).toBeInTheDocument();

    await user.click(executeButton!);
    expect(screen.getByText(/value is 2/)).toBeInTheDocument();

    await user.click(executeButton!);
    expect(screen.getByText(/value is 3/)).toBeInTheDocument();
  });
});

describe('Invalid function call (invalidFunctionCall)', () => {
  it('validates invalidFunctionCall as invalid', () => {
    const validation = validate(invalidFunctionCall);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about undefined variable', () => {
    const validation = validate(invalidFunctionCall);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.undefinedVariable, 'call', 0, 'currentFunction');
  });

  it('parses invalidFunctionCall into button, click, and call nodes', () => {
    const nodes = parse(invalidFunctionCall);
    expect(nodes.length).toBeGreaterThan(0);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('$currentFunction');
  });
});

describe('Invalid function call 2 (invalidFunctionCall2)', () => {
  it('validates invalidFunctionCall2 as invalid', () => {
    const validation = validate(invalidFunctionCall2);
    expect(validation.isValid).toBe(false);
  });

  it('provides helpful error message about undefined function', () => {
    const validation = validate(invalidFunctionCall2);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, ValidatorErrors.undefinedFunction, 'call', 0, 'currentFunction');
  });

  it('parses invalidFunctionCall2 into button, click, and call nodes', () => {
    const nodes = parse(invalidFunctionCall2);
    expect(nodes.length).toBeGreaterThan(0);

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('currentFunction');
  });
});

describe('Invalid runtime function call (invalidRunTimeFunctionCall)', () => {
  it('validates invalidRunTimeFunctionCall as valid (static validation passes)', () => {
    const validation = validate(invalidRunTimeFunctionCall);
    expect(validation.isValid).toBe(true);
  });

  it('parses invalidRunTimeFunctionCall correctly', () => {
    const nodes = parse(invalidRunTimeFunctionCall);
    expect(nodes.length).toBeGreaterThan(0);

    const incrementFunctionNode = nodes.find((n) => n.type === 'function' && n.data === 'increment');
    expect(incrementFunctionNode).toBeDefined();

    const decrementFunctionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('decrement'));
    expect(decrementFunctionNode).toBeDefined();
    expect(decrementFunctionNode?.data).toBe('decrement param');

    const stateNodes = nodes.filter((n) => n.type === 'state');
    const currentFunctionStateNode = stateNodes.find((n) => n.children.some((c) => c.type === 'currentFunction'));
    expect(currentFunctionStateNode).toBeDefined();
    const currentFunctionChild = currentFunctionStateNode?.children.find((c) => c.type === 'currentFunction');
    expect(currentFunctionChild).toBeDefined();
    expect(currentFunctionChild?.data).toBe('increment');
  });

  it('renders invalidRunTimeFunctionCall with initial state', () => {
    const node = renderPtml(invalidRunTimeFunctionCall);
    render(<div>{node}</div>);

    expect(screen.getByText(/value is 0/)).toBeInTheDocument();
    expect(screen.getAllByText(/increment/).length).toBeGreaterThan(0);
    expect(screen.getByText(/set currentFunction to increment/)).toBeInTheDocument();
    expect(screen.getByText(/set currentFunction to decrement/)).toBeInTheDocument();
  });

  it('displays error on screen when calling decrement function without required parameter', async () => {
    const user = userEvent.setup();
    const node = renderPtml(invalidRunTimeFunctionCall);
    render(<div>{node}</div>);

    const setToDecrementButton = screen.getByRole('button', { name: /set currentFunction to decrement/ });
    await user.click(setToDecrementButton);

    expect(screen.getAllByText(/decrement/).length).toBeGreaterThan(0);

    const executeButtons = screen.getAllByRole('button', { name: /decrement/ });
    const executeButton = executeButtons.find((btn) => btn.textContent === 'decrement');
    expect(executeButton).toBeDefined();

    await user.click(executeButton!);

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent(/PTML Runtime Error/i);
    expect(errorAlert).toHaveTextContent(/parameter/i);
    expect(errorAlert).toHaveTextContent(/decrement/i);
    expect(errorAlert).toHaveTextContent(/argument/i);
    expect(errorAlert).toHaveTextContent(/expects/i);
  });
});

describe('Add digit function with nested pipe expression (addDigit)', () => {
  it('validates addDigit', () => {
    const validation = validate(addDigit);
    expect(validation.isValid).toBe(true);
  });

  it('parses addDigit into function node with nested pipe expression', () => {
    const nodes = parse(addDigit);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function' && n.data?.startsWith('addDigit'));
    expect(functionNode).toBeDefined();
    expect(functionNode?.data).toBe('addDigit digit');
    expect(functionNode?.children.length).toBe(1);

    const setNode = functionNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$display ($display 10 | multiply) $digit | add');

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const displayStateChild = stateNode?.children.find((child) => child.type === 'display');
    expect(displayStateChild).toBeDefined();
    expect(displayStateChild?.data).toBe('1');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('addDigit 9');
  });

  it('renders addDigit with initial state value', () => {
    const node = renderPtml(addDigit);
    render(<div>{node}</div>);

    expect(screen.getByText(/display is 1/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'add 9' })).toBeInTheDocument();
  });

  it('evaluates nested pipe expression when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(addDigit);
    render(<div>{node}</div>);

    expect(screen.getByText(/display is 1/)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'add 9' });
    await user.click(button);

    expect(screen.getByText(/display is 19/)).toBeInTheDocument();
    expect(screen.queryByText(/^display is 1$/)).not.toBeInTheDocument();
  });

  it('evaluates nested pipe expression correctly on multiple clicks', async () => {
    const user = userEvent.setup();
    const node = renderPtml(addDigit);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'add 9' });

    await user.click(button);
    expect(screen.getByText(/display is 19/)).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText(/display is 199/)).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText(/display is 1999/)).toBeInTheDocument();
  });
});

describe('Clear input function (clearInput)', () => {
  it('validates clearInput', () => {
    const validation = validate(clearInput);
    expect(validation.isValid).toBe(true);
  });

  it('parses clearInput into function node with clear child', () => {
    const nodes = parse(clearInput);
    expect(nodes.length).toBeGreaterThan(0);

    const functionNode = nodes.find((n) => n.type === 'function' && n.data === 'clearInput');
    expect(functionNode).toBeDefined();
    expect(functionNode?.children.length).toBe(1);

    const clearNode = functionNode?.children.find((child) => child.type === 'clear');
    expect(clearNode).toBeDefined();
    expect(clearNode?.data).toBe('$input');

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    const inputStateChild = stateNode?.children.find((child) => child.type === 'input');
    expect(inputStateChild).toBeDefined();
    expect(inputStateChild?.data).toBe('hello world');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const boxNode = ptmlNode?.children.find((n) => n.type === 'box');
    expect(boxNode).toBeDefined();

    const buttonNode = boxNode?.children.find((child) => child.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const callNode = clickNode?.children.find((child) => child.type === 'call');
    expect(callNode).toBeDefined();
    expect(callNode?.data).toBe('clearInput');
  });

  it('renders clearInput with initial state value', () => {
    const node = renderPtml(clearInput);
    render(<div>{node}</div>);

    expect(screen.getByText(/input is hello world/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'clear input' })).toBeInTheDocument();
  });

  it('clears state variable when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(clearInput);
    render(<div>{node}</div>);

    expect(screen.getByText(/input is hello world/)).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'clear input' });
    await user.click(button);

    expect(screen.getByText(/input is\s*$/)).toBeInTheDocument();
    expect(screen.queryByText(/input is hello world/)).not.toBeInTheDocument();
  });
});
