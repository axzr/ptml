import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  basicCheckbox,
  checkboxWithValue,
  checkboxInForm,
  checkboxWithStyles,
  multipleCheckboxesInForm,
} from './checkbox.example';
import { render as renderPtml, validate, parse } from '../../index';

describe('Checkbox (basicCheckbox)', () => {
  it('validates basicCheckbox', () => {
    const validation = validate(basicCheckbox);
    expect(validation.isValid).toBe(true);
  });

  it('parses basicCheckbox into checkbox node with id', () => {
    const nodes = parse(basicCheckbox);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const checkboxNode = ptmlNode?.children.find((node) => node.type === 'checkbox');
    expect(checkboxNode).toBeDefined();
    expect(checkboxNode?.type).toBe('checkbox');

    const idNode = checkboxNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('accept');
  });

  it('renders basicCheckbox as an unchecked checkbox', () => {
    const node = renderPtml(basicCheckbox);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('id', 'accept');
    expect(checkbox).toHaveAttribute('type', 'checkbox');
    expect(checkbox).not.toBeChecked();
  });
});

describe('Checkbox (checkboxWithValue)', () => {
  it('validates checkboxWithValue', () => {
    const validation = validate(checkboxWithValue);
    expect(validation.isValid).toBe(true);
  });

  it('parses checkboxWithValue into state and checkbox nodes', () => {
    const nodes = parse(checkboxWithValue);
    expect(nodes.length).toBeGreaterThanOrEqual(2);

    const stateNode = nodes.find((node) => node.type === 'state');
    expect(stateNode).toBeDefined();
    const agreedChild = stateNode?.children.find((c) => c.type === 'agreed');
    expect(agreedChild).toBeDefined();
    expect(agreedChild?.data).toBe('false');

    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const checkboxNode = ptmlNode?.children.find((node) => node.type === 'checkbox');
    expect(checkboxNode).toBeDefined();

    const valueNode = checkboxNode?.children.find((child) => child.type === 'value');
    expect(valueNode).toBeDefined();
    expect(valueNode?.data).toBe('$agreed');
  });

  it('renders checkboxWithValue with checked state from state variable', () => {
    const node = renderPtml(checkboxWithValue);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('toggles checkboxWithValue and updates state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(checkboxWithValue);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});

describe('Checkbox (checkboxInForm)', () => {
  it('validates checkboxInForm', () => {
    const validation = validate(checkboxInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses checkboxInForm into form, checkbox, and button nodes', () => {
    const nodes = parse(checkboxInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const checkboxNode = formNode?.children.find((node) => node.type === 'checkbox');
    expect(checkboxNode).toBeDefined();

    const idNode = checkboxNode?.children.find((child) => child.type === 'id');
    expect(idNode).toBeDefined();
    expect(idNode?.data).toBe('agree');
  });

  it('renders checkboxInForm with checkbox inside form', () => {
    const node = renderPtml(checkboxInForm);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.tagName).toBe('INPUT');
    expect(checkbox).toHaveAttribute('id', 'agree');
  });

  it('toggles checkboxInForm and updates form state', async () => {
    const user = userEvent.setup();
    const node = renderPtml(checkboxInForm);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });
});

describe('Checkbox (checkboxWithStyles)', () => {
  it('validates checkboxWithStyles', () => {
    const validation = validate(checkboxWithStyles);
    expect(validation.isValid).toBe(true);
  });

  it('parses checkboxWithStyles into checkbox node with styles', () => {
    const nodes = parse(checkboxWithStyles);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();
    const checkboxNode = ptmlNode?.children.find((node) => node.type === 'checkbox');
    expect(checkboxNode).toBeDefined();

    const stylesNode = checkboxNode?.children.find((child) => child.type === 'styles');
    expect(stylesNode).toBeDefined();
    expect(stylesNode?.children.length).toBeGreaterThan(0);
  });

  it('renders checkboxWithStyles with applied styles', () => {
    const node = renderPtml(checkboxWithStyles);
    render(<div>{node}</div>);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveStyle({ width: '1.5em', height: '1.5em', margin: '0.5em' });
  });
});

describe('Checkbox (multipleCheckboxesInForm)', () => {
  it('validates multipleCheckboxesInForm', () => {
    const validation = validate(multipleCheckboxesInForm);
    expect(validation.isValid).toBe(true);
  });

  it('parses multipleCheckboxesInForm into form with multiple checkboxes', () => {
    const nodes = parse(multipleCheckboxesInForm);
    const ptmlNode = nodes.find((node) => node.type === 'ptml');
    expect(ptmlNode).toBeDefined();

    const formNode = ptmlNode?.children.find((node) => node.type === 'form');
    expect(formNode).toBeDefined();

    const checkboxNodes = formNode?.children.filter((node) => node.type === 'checkbox') || [];
    expect(checkboxNodes.length).toBe(2);

    const newsletterCheckbox = checkboxNodes.find((node) => {
      const idNode = node.children.find((child) => child.type === 'id');
      return idNode?.data === 'newsletter';
    });
    expect(newsletterCheckbox).toBeDefined();

    const termsCheckbox = checkboxNodes.find((node) => {
      const idNode = node.children.find((child) => child.type === 'id');
      return idNode?.data === 'terms';
    });
    expect(termsCheckbox).toBeDefined();
  });

  it('renders multipleCheckboxesInForm with all checkboxes', () => {
    const node = renderPtml(multipleCheckboxesInForm);
    render(<div>{node}</div>);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toHaveAttribute('id', 'newsletter');
    expect(checkboxes[1]).toHaveAttribute('id', 'terms');
  });

  it('toggling one checkbox updates only that form field', async () => {
    const user = userEvent.setup();
    const node = renderPtml(multipleCheckboxesInForm);
    render(<div>{node}</div>);

    const [newsletterCheckbox, termsCheckbox] = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(newsletterCheckbox).not.toBeChecked();
    expect(termsCheckbox).not.toBeChecked();

    await user.click(newsletterCheckbox);

    expect(newsletterCheckbox).toBeChecked();
    expect(termsCheckbox).not.toBeChecked();
  });
});
