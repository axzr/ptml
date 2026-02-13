import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { basicInput, inputWithStyles, inputWithValue, inputInForm, inputDifferentTypes } from './input.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Input (basicInput)', () => {
  it('validates basicInput', () => {
    const validation = validate(basicInput);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicInput into input node with id and type', () => {
    const nodes = parse(basicInput);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const inputNode = ptmlNode?.children.find((node) => node.type === 'input');
    expect(inputNode).toBeDefined();
    expect(inputNode?.type).toBe('input');

    const idNode = inputNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('name');

    const typeNode = inputNode?.children.find((child) => child.type === 'type');
    expect(typeNode).toBeDefined();
    expect(typeNode?.data).toBe('text');
  });

  it('renders basicInput as an input element', () => {
    const node = renderPtml(basicInput);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('id', 'name');
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('Input (inputWithStyles)', () => {
  it('validates inputWithStyles', () => {
    const validation = validate(inputWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses inputWithStyles into input node with id, type, and styles', () => {
    const nodes = parse(inputWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const inputNode = ptmlNode?.children.find((node) => node.type === 'input');
    expect(inputNode).toBeDefined();
    expect(inputNode?.type).toBe('input');

    const idNode = inputNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('email');

    const typeNode = inputNode?.children.find((child) => child.type === 'type');
    expect(typeNode).toBeDefined();
    expect(typeNode?.data).toBe('email');

    const stylesNode = inputNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders inputWithStyles with applied styles', () => {
    const node = renderPtml(inputWithStyles);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveStyle({ width: '100%', padding: '0.5em' });
  });
});

describe('Input (inputWithValue)', () => {
  it('validates inputWithValue', () => {
    const validation = validate(inputWithValue);
    expect(validation.isValid).toBe(true);
  });

  it('parses inputWithValue into state and input nodes', () => {
    const nodes = parse(inputWithValue);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    const userNameChild = stateNode?.children.find((c) => c.type === 'userName');
    expect(userNameChild).toBeDefined();
    expect(userNameChild?.data).toBe('John Doe');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const inputNode = ptmlNode?.children.find((node) => node.type === 'input');
    expect(inputNode).toBeDefined();

    const valueNode = inputNode?.children.find((child) => child.type === 'value');
    expect(valueNode).toBeDefined();
    expect(valueNode?.data).toBe('$userName');
  });

  it('renders inputWithValue with initial value from state', () => {
    const node = renderPtml(inputWithValue);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('John Doe');
  });

  it('allows modifying inputWithValue and updates state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(inputWithValue);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('John Doe');
    expect(input).not.toBeDisabled();

    await user.clear(input);
    await user.type(input, 'Jane Smith');

    expect(input.value).toBe('Jane Smith');
  });
});

describe('Input (inputInForm)', () => {
  it('validates inputInForm', () => {
    const validation = validate(inputInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses inputInForm into form, input, and button nodes', () => {
    const nodes = parse(inputInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const inputNode = formNode?.children.find((node) => node.type === 'input');
    expect(inputNode).toBeDefined();

    const idNode = inputNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('name');

    const typeNode = inputNode?.children.find((child) => child.type === 'type');
    expect(typeNode).toBeDefined();
    expect(typeNode?.data).toBe('text');
  });

  it('renders inputInForm with input inside form', () => {
    const node = renderPtml(inputInForm);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('updates form state when input value changes', async () => {
    const user = userEvent.setup();
    const node = renderPtml(inputInForm);
    render(<div>{node}</div>);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');

    await user.type(input, 'Test name');

    expect(input.value).toBe('Test name');
  });
});

describe('Input (inputDifferentTypes)', () => {
  it('validates inputDifferentTypes', () => {
    const validation = validate(inputDifferentTypes);
    expect(validation.isValid).toBe(true);
  });

  it('parses inputDifferentTypes into form with multiple input types', () => {
    const nodes = parse(inputDifferentTypes);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const inputNodes = formNode?.children.filter((node) => node.type === 'input') || [];
    expect(inputNodes.length).toBe(3);

    const emailInput = inputNodes.find((node) => {
      const idNode = node.children.find((child) => child.type === 'id');
      return idNode?.data === 'email';
    });
    expect(emailInput).toBeDefined();
    const emailTypeNode = emailInput?.children.find((child) => child.type === 'type');
    expect(emailTypeNode?.data).toBe('email');

    const passwordInput = inputNodes.find((node) => {
      const idNode = node.children.find((child) => child.type === 'id');
      return idNode?.data === 'password';
    });
    expect(passwordInput).toBeDefined();
    const passwordTypeNode = passwordInput?.children.find((child) => child.type === 'type');
    expect(passwordTypeNode?.data).toBe('password');

    const ageInput = inputNodes.find((node) => {
      const idNode = node.children.find((child) => child.type === 'id');
      return idNode?.data === 'age';
    });
    expect(ageInput).toBeDefined();
    const ageTypeNode = ageInput?.children.find((child) => child.type === 'type');
    expect(ageTypeNode?.data).toBe('number');
  });

  it('renders inputDifferentTypes with all input types', () => {
    const node = renderPtml(inputDifferentTypes);
    render(<div>{node}</div>);

    const emailInput = screen.getByRole('textbox');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('id', 'email');

    const passwordInput = document.getElementById('password') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput.tagName).toBe('INPUT');

    const ageInput = screen.getByRole('spinbutton');
    expect(ageInput).toBeInTheDocument();
    expect(ageInput).toHaveAttribute('type', 'number');
    expect(ageInput).toHaveAttribute('id', 'age');
  });
});
