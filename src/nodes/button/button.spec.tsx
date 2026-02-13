import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { basicButton, buttonTextWithState, disabledButton, toggleStateButton } from './button.example';
import { setStateButton, incrementButton, invalidSetNode, invalidSetStateButton } from '../click/click.example';
import { render as renderPtml, validate, parse } from '../../index';
import { expectErrorToMatchIgnoringLineNumber } from '../../errors/testHelpers';
import { VariableErrors } from '../../errors/messages';

describe('Buttons (basicButton)', () => {
  it('validates basicButton', () => {
    const validation = validate(basicButton);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicButton into button node with text and styles children', () => {
    const nodes = parse(basicButton);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const buttonNode = ptmlNode?.children.find((node) => node.type === 'button');
    expect(buttonNode).toBeDefined();
    expect(buttonNode?.type).toBe('button');
    expect(buttonNode?.children).toHaveLength(2);

    const textNode = buttonNode?.children.find((child) => child.type === 'text');
    expect(textNode).toBeDefined();
    expect(textNode?.data).toBe('a non-functional button');

    const stylesNode = buttonNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders basicButton as a button element with text and styles', () => {
    const node = renderPtml(basicButton);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'a non-functional button' });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });
});

describe('Buttons (setStateButton)', () => {
  it('validates setStateButton', () => {
    const validation = validate(setStateButton);
    expect(validation.isValid).toBe(true);
  });

  it('parses setStateButton into state, button with click handler, and box nodes', () => {
    const nodes = parse(setStateButton);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const nameChild = stateNode?.children.find((c) => c.type === 'name');
    expect(nameChild).toBeDefined();
    expect(nameChild?.data).toBe('Dave');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((node) => node.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const setNode = clickNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$name John');
  });

  it('renders setStateButton with initial state value', () => {
    const node = renderPtml(setStateButton);
    render(<div>{node}</div>);

    expect(screen.getByText('Hello, Dave!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'change name to John' })).toBeInTheDocument();
  });

  it('updates state when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(setStateButton);
    render(<div>{node}</div>);

    expect(screen.getByText('Hello, Dave!')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'change name to John' });
    await user.click(button);

    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
    expect(screen.queryByText('Hello, Dave!')).not.toBeInTheDocument();
  });
});

describe('Buttons (incrementButton)', () => {
  it('validates incrementButton', () => {
    const validation = validate(incrementButton);
    expect(validation.isValid).toBe(true);
  });

  it('parses incrementButton with pipe function expression in set operation', () => {
    const nodes = parse(incrementButton);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((node) => node.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const setNode = clickNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$count ($count 1 | add)');
  });

  it('renders incrementButton with initial count value', () => {
    const node = renderPtml(incrementButton);
    render(<div>{node}</div>);

    expect(screen.getByText('count is 0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'increment' })).toBeInTheDocument();
  });

  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(incrementButton);
    render(<div>{node}</div>);

    expect(screen.getByText('count is 0')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'increment' });
    await user.click(button);

    expect(screen.getByText('count is 1')).toBeInTheDocument();
    expect(screen.queryByText('count is 0')).not.toBeInTheDocument();
  });

  it('increments count multiple times on repeated clicks', async () => {
    const user = userEvent.setup();
    const node = renderPtml(incrementButton);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'increment' });

    await user.click(button);
    expect(screen.getByText('count is 1')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('count is 2')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('count is 3')).toBeInTheDocument();
  });
});

describe('Buttons (invalidSetNode)', () => {
  it('rejects set node without $ prefix on variable name', () => {
    const validation = validate(invalidSetNode);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for invalid set node', () => {
    const validation = validate(invalidSetNode);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.variableNameMustStartWithDollar, 'set', 0, 'name');
  });
});

describe('Buttons (invalidSetStateButton)', () => {
  it('rejects set node with undefined state variable reference', () => {
    const validation = validate(invalidSetStateButton);
    expect(validation.isValid).toBe(false);
  });

  it('provides informative error message for undefined state variable', () => {
    const validation = validate(invalidSetStateButton);
    expect(validation.isValid).toBe(false);
    expectErrorToMatchIgnoringLineNumber(validation, VariableErrors.undefinedVariableInExpression, 'set', 0, 'John');
  });

  it('parses invalidSetStateButton into nodes despite validation error', () => {
    const nodes = parse(invalidSetStateButton);
    expect(nodes.length).toBeGreaterThan(0);

    const stateNode = nodes.find((n) => n.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const nameChild = stateNode?.children.find((c) => c.type === 'name');
    expect(nameChild).toBeDefined();
    expect(nameChild?.data).toBe('Dave');

    const ptmlNode = nodes.find((n) => n.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((n) => n.type === 'button');
    expect(buttonNode).toBeDefined();
  });
});

describe('Buttons (buttonTextWithState)', () => {
  it('validates buttonTextWithState', () => {
    const validation = validate(buttonTextWithState);
    expect(validation.isValid).toBe(true);
  });

  it('parses buttonTextWithState into state and button nodes with text containing state variables', () => {
    const nodes = parse(buttonTextWithState);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNodes = nodes.filter((node) => node.type === 'state');
    expect(stateNodes.length).toBe(1);
    const stateNode = stateNodes[0];
    expect(stateNode.data).toBe('');
    const divisorChild = stateNode.children.find((c) => c.type === 'divisor');
    expect(divisorChild).toBeDefined();
    expect(divisorChild?.data).toBe('0');
    const countChild = stateNode.children.find((c) => c.type === 'count');
    expect(countChild).toBeDefined();
    expect(countChild?.data).toBe('1');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNodes = ptmlNode?.children.filter((node) => node.type === 'button') || [];
    expect(buttonNodes.length).toBe(2);

    const firstButtonTextNode = buttonNodes[0]?.children.find((child) => child.type === 'text');
    expect(firstButtonTextNode?.data).toBe('divisor is $divisor');

    const secondButtonTextNode = buttonNodes[1]?.children.find((child) => child.type === 'text');
    expect(secondButtonTextNode?.data).toBe('count is $count');
  });

  it('renders buttonTextWithState with interpolated state values in button text', () => {
    const node = renderPtml(buttonTextWithState);
    render(<div>{node}</div>);

    expect(screen.getByRole('button', { name: 'divisor is 0' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'count is 1' })).toBeInTheDocument();
  });
});

describe('Buttons (disabledButton)', () => {
  it('validates disabledButton', () => {
    const validation = validate(disabledButton);
    expect(validation.isValid).toBe(true);
  });

  it('parses disabledButton with disabled node containing conditional expression', () => {
    const nodes = parse(disabledButton);
    expect(nodes.length).toBeGreaterThanOrEqual(3);

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((node) => node.type === 'button');
    expect(buttonNode).toBeDefined();

    const disabledNode = buttonNode?.children.find((child) => child.type === 'disabled');
    expect(disabledNode).toBeDefined();
    expect(disabledNode?.data).toBe('$divisor is 0');
  });

  it('renders disabledButton with button disabled when divisor is 0', () => {
    const node = renderPtml(disabledButton);
    render(<div>{node}</div>);

    const divideButton = screen.getByRole('button', { name: 'divide by 0' });
    expect(divideButton).toBeInTheDocument();
    expect(divideButton).toBeDisabled();
  });

  it('enables button when divisor changes from 0 to non-zero', async () => {
    const user = userEvent.setup();
    const node = renderPtml(disabledButton);
    render(<div>{node}</div>);

    const divideButton = screen.getByRole('button', { name: 'divide by 0' });
    expect(divideButton).toBeDisabled();

    const incrementButton = screen.getByRole('button', { name: 'increment divisor' });
    await user.click(incrementButton);

    const updatedDivideButton = screen.getByRole('button', { name: 'divide by 1' });
    expect(updatedDivideButton).toBeInTheDocument();
    expect(updatedDivideButton).not.toBeDisabled();
  });

  it('disables button again when divisor returns to 0', async () => {
    const user = userEvent.setup();
    const node = renderPtml(disabledButton);
    render(<div>{node}</div>);

    const incrementButton = screen.getByRole('button', { name: 'increment divisor' });
    await user.click(incrementButton);

    let divideButton = screen.getByRole('button', { name: 'divide by 1' });
    expect(divideButton).not.toBeDisabled();

    const decrementButton = screen.getByRole('button', { name: 'decrement divisor' });
    await user.click(decrementButton);

    divideButton = screen.getByRole('button', { name: 'divide by 0' });
    expect(divideButton).toBeDisabled();
  });
});

describe('Buttons (toggleStateButton)', () => {
  it('validates toggleStateButton', () => {
    const validation = validate(toggleStateButton);
    expect(validation.isValid).toBe(true);
  });

  it('parses toggleStateButton with set operation containing negation operator', () => {
    const nodes = parse(toggleStateButton);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    expect(stateNode?.data).toBe('');
    const isActiveChild = stateNode?.children.find((c) => c.type === 'isActive');
    expect(isActiveChild).toBeDefined();
    expect(isActiveChild?.data).toBe('false');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const buttonNode = ptmlNode?.children.find((node) => node.type === 'button');
    expect(buttonNode).toBeDefined();

    const clickNode = buttonNode?.children.find((child) => child.type === 'click');
    expect(clickNode).toBeDefined();

    const setNode = clickNode?.children.find((child) => child.type === 'set');
    expect(setNode).toBeDefined();
    expect(setNode?.data).toBe('$isActive !$isActive');
  });

  it('renders toggleStateButton with initial false state value', () => {
    const node = renderPtml(toggleStateButton);
    render(<div>{node}</div>);

    expect(screen.getByText('isActive is false')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'toggle the state' })).toBeInTheDocument();
  });

  it('toggles state from false to true when button is clicked', async () => {
    const user = userEvent.setup();
    const node = renderPtml(toggleStateButton);
    render(<div>{node}</div>);

    expect(screen.getByText('isActive is false')).toBeInTheDocument();

    const button = screen.getByRole('button', { name: 'toggle the state' });
    await user.click(button);

    expect(screen.getByText('isActive is true')).toBeInTheDocument();
    expect(screen.queryByText('isActive is false')).not.toBeInTheDocument();
  });

  it('toggles state from true back to false on second click', async () => {
    const user = userEvent.setup();
    const node = renderPtml(toggleStateButton);
    render(<div>{node}</div>);

    const button = screen.getByRole('button', { name: 'toggle the state' });

    await user.click(button);
    expect(screen.getByText('isActive is true')).toBeInTheDocument();

    await user.click(button);
    expect(screen.getByText('isActive is false')).toBeInTheDocument();
    expect(screen.queryByText('isActive is true')).not.toBeInTheDocument();
  });
});
